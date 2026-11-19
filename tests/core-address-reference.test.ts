import test from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import {createRequire} from 'node:module';
import {pathToFileURL} from 'node:url';
import {transformWithOxc} from 'vite';
import {addressSchema} from '../contracts/party.ts';

test('address reference callbacks use exact parent scope, retain historical labels and preserve explicit change semantics',async()=>{
 const calls:{module:string;kind:string;args:any[]}[]=[];
 const fixture:any={Picker:function Picker(){},country:{},state:{},district:{},city:{},pincode:{},'address-type':{}};
 const parents:Record<string,string>={state:'countryId',district:'stateId',city:'districtId',pincode:'cityId'};
 const selected:Record<string,any>={state:{public_id:'state001',name:'Historical state',active:false,countryId:'country1'},district:{public_id:'distr001',name:'District',active:true,stateId:'state001'},city:{public_id:'city0001',name:'City',active:true,districtId:'distr001'},pincode:{public_id:'postal01',name:'641001',active:true,cityId:'city0001'}};
 for(const[module,type]of[['country','Country'],['state','State'],['district','District'],['city','City'],['pincode','Pincode'],['address-type','AddressType']]){
  fixture[module]['load'+type+'ReferencePage']=(...args:any[])=>{calls.push({module,kind:'page',args});return Promise.resolve({rows:[],total:0,page:1,pageSize:25});};
  fixture[module]['get'+type]=(...args:any[])=>{calls.push({module,kind:'selected',args});return Promise.resolve(selected[module]);};
  fixture[module]['get'+type+'Reference']=fixture[module]['get'+type];
 }
 (globalThis as any).__coreAddressFixture=fixture;
 try{
  const source=await readFile(new URL('../src/web/modules/shared/address-references.tsx',import.meta.url),'utf8');
  const transformed=await transformWithOxc(source,'address-references.tsx');
  const require=createRequire(import.meta.url);
  const code=transformed.code.replace(/import\s*\{([^}]+)\}\s*from\s*["']([^"']+)["'];?/g,(_all,names:string,id:string)=>{
   if(id==='react/jsx-runtime')return 'import {'+names+'} from '+JSON.stringify(pathToFileURL(require.resolve(id)).href)+';';
   if(id==='react')return 'const useCallback=(callback)=>callback;';
   if(id==='@workspace/ui/blocks/upsert-form')return 'const UpsertFormField=()=>null;';
   if(id==='./reference-picker')return 'const ReferencePicker=globalThis.__coreAddressFixture.Picker;';
   if(id.startsWith('../common/'))return 'const {'+names+'}=globalThis.__coreAddressFixture['+JSON.stringify(id.split('/').at(-1))+'];';
   throw Error('Unexpected test import '+id);
  });
  // Isolate callback construction only. Real React cancellation/render tests belong to ReferencePicker's owner.
  const {AddressReferences}=await import('data:text/javascript;base64,'+Buffer.from(code).toString('base64'));
  const patches:any[]=[];
  const address=addressSchema.parse({addressLine1:'Existing street',country:'Existing free-text country',state:'Existing free-text state',city:'Existing city',postalCode:'Existing postal',countryId:'country1',stateId:'state001',districtId:'distr001',cityId:'city0001',pincodeId:'postal01'});
  const render=(value:any)=>{const element=AddressReferences({id:'fixture',index:0,address:value,onChange:(patch:any)=>patches.push(patch)});return Object.fromEntries(element.props.children.map((field:any)=>{const picker=field.props.children;return[picker.props.ariaLabel,picker.props];}));};
  let fields=render(address);
  assert.equal(calls.length,0,'constructing the address fields never loads whole foreign catalogues or patches text');assert.equal(patches.length,0);
  const controller=new AbortController(),query={page:0,pageSize:25,search:'off-page',sort:null,filters:{},filterId:null};
  for(const[module,label,parentId]of[['state','State reference 1','country1'],['district','District reference 1','state001'],['city','City reference 1','distr001'],['pincode','Postal-code reference 1','city0001']]){
   await fields[label].loadPage(query,controller.signal);
   const last=calls.at(-1)!;assert.equal(last.module,module);assert.equal(last.kind,'page');assert.equal(last.args[1],controller.signal);assert.deepEqual(last.args[2],{[parents[module]]:parentId});assert.equal(fields[label].scopeKey,parentId);
  }
  const historical=await fields['State reference 1'].loadSelected('state001',controller.signal);assert.equal(historical.active,false);assert.equal(historical.name,'Historical state');assert.equal(patches.length,0,'historical label resolution never rewrites address data');
  selected.state={...selected.state,countryId:'foreign1'};await assert.rejects(fields['State reference 1'].loadSelected('state001',controller.signal),/does not belong/);
  fields['Country reference 1'].onValueChange('country2',{public_id:'country2',name:'Chosen country',active:true});assert.deepEqual(patches.pop(),{countryId:'country2',country:'Chosen country',stateId:'',districtId:'',cityId:'',pincodeId:''});
  fields['Country reference 1'].onValueChange('');assert.equal(patches.pop().country,address.country,'clearing a managed ID preserves explicitly entered address text');
  fields=render({...address,countryId:'country2'});assert.equal(fields['State reference 1'].scopeKey,'country2');await fields['State reference 1'].loadPage(query,controller.signal);assert.deepEqual(calls.at(-1)!.args[2],{countryId:'country2'});
  fields=render({...address,countryId:''});assert.equal(fields['State reference 1'].disabled,true);assert.equal(fields['State reference 1'].scopeKey,'');assert.equal((await fields['State reference 1'].loadSelected('state001',controller.signal)).name,'Historical state','missing parent retains historical selected label read-only');
 }finally{delete (globalThis as any).__coreAddressFixture;}
});
