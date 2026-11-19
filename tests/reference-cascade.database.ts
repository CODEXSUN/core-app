import test from'node:test';
import assert from'node:assert/strict';
import{withTestDatabase}from'./database-harness.ts';
test('exact parent-public-ID page constraints preserve address cascade scope before counts/search/paging',{timeout:180000},async()=>{
 await withTestDatabase(async({db,app,headersA,headersB})=>{
  const create=async(collection:string,payload:unknown,headers=headersA)=>{const response=await app.inject({method:'POST',url:'/api/v1/'+collection,headers,payload});assert.equal(response.statusCode,201,response.body);return response.json();};
  const first=await create('countries',{name:'Shared parent',code:'AA',active:true}),second=await create('countries',{name:'Shared parent extended',code:'AB',active:true}),foreign=await create('countries',{name:'Shared parent',code:'AA',active:true},headersB);
  const state1=await create('states',{name:'State first',code:'STA1',countryId:first.public_id,active:true}),state2=await create('states',{name:'State second',code:'STA2',countryId:first.public_id,active:true}),stateOther=await create('states',{name:'State other',code:'STA3',countryId:second.public_id,active:true}),stateForeign=await create('states',{name:'State foreign',code:'STB1',countryId:foreign.public_id,active:true},headersB);
  const district=await create('districts',{name:'District first',stateId:state1.public_id,active:true}),districtOther=await create('districts',{name:'District second',stateId:stateOther.public_id,active:true});
  const city=await create('cities',{name:'City first',districtId:district.public_id,active:true}),cityOther=await create('cities',{name:'City second',districtId:districtOther.public_id,active:true});
  await create('pincodes',{name:'641001',cityId:city.public_id,area:'Fixture',active:true});
  const get=(collection:string,refs:unknown,extra='',headers=headersA)=>app.inject({url:'/api/v1/'+collection+'/page?references='+encodeURIComponent(JSON.stringify(refs))+extra,headers});
  const a=await get('states',{countryId:first.public_id},'&pageSize=1'),b=await get('states',{countryId:first.public_id},'&pageSize=1&page=2');assert.equal(a.statusCode,200,a.body);assert.equal(a.json().total,2);assert.equal(b.json().total,2);assert.notEqual(a.json().rows[0].public_id,b.json().rows[0].public_id);
  const changed=await get('states',{countryId:second.public_id});assert.equal(changed.json().total,1);assert.equal(changed.json().rows[0].public_id,stateOther.public_id,'changing parents does not reuse a previous page');
  assert.equal((await get('states',{countryId:first.public_id},'&q=State%20second')).json().rows[0].public_id,state2.public_id);
  assert.equal((await get('states',{countryId:first.public_id},'&q=extended')).json().total,0,'exact ID scope is not inferred from overlapping display names');
  assert.equal((await get('states',{countryId:first.public_id},'&filters='+encodeURIComponent(JSON.stringify({countryId:'Shared'})))).json().total,2,'existing contains-text filters remain separate from exact scope');
  for(const[collection,field,parent,other]of[['districts','stateId',state1.public_id,state2.public_id],['cities','districtId',district.public_id,districtOther.public_id],['pincodes','cityId',city.public_id,cityOther.public_id]]){const response=await get(collection,{[field]:parent});assert.equal(response.statusCode,200,response.body);assert.equal(response.json().total,1);const changed=await get(collection,{[field]:other});assert.equal(changed.statusCode,200);assert.equal(changed.json().total,collection==='cities'?1:0);}
  assert.equal((await get('states',{countryId:foreign.public_id})).statusCode,409,'a valid foreign parent is rejected, not used for counts');assert.equal((await get('states',{countryId:first.public_id},'',headersB)).statusCode,409);assert.equal((await get('districts',{stateId:stateForeign.public_id})).statusCode,409);
  for(const refs of[{countryId:'../bad'},{countryId:''},{tenantId:first.public_id},{countryId:first.public_id,unexpected:first.public_id}])assert.equal((await get('states',refs)).statusCode,400);
  assert.equal((await get('brands',{countryId:first.public_id})).statusCode,400,'unsupported owner reference constraints fail closed');
  await db.updateTable('countries').set({active:false}).where('public_id','=',first.public_id).execute();assert.equal((await get('states',{countryId:first.public_id})).statusCode,409,'inactive parent cannot provide new reference choices');const historical=await app.inject({url:'/api/v1/countries/'+first.public_id,headers:headersA});assert.equal(historical.statusCode,200);assert.equal(historical.json().active,false,'historical selected labels remain separately readable');
 });
});
