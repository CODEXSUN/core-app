import test from 'node:test';
import assert from 'node:assert/strict';
import {setTimeout as delay} from 'node:timers/promises';
import {createReferencePageController,createSelectedReferenceController} from '../src/web/modules/shared/reference-controller.ts';
import {loadReferencePage,loadSelectedReference,ReferenceRequestError,type ReferenceRecord} from '../src/web/modules/shared/reference-transport.ts';
const record=(id:string,active=true):ReferenceRecord=>({public_id:id,name:'Reference '+id,active});
async function settled(controller:{snapshot:()=>{loading:boolean}}){for(let index=0;index<100&&controller.snapshot().loading;index++)await delay(5);assert.equal(controller.snapshot().loading,false);}

test('reference catalogue stays unloaded until opened and only the server page is retained',async()=>{
 const data=Array.from({length:5000},(_,index)=>record('r'+String(index+1).padStart(7,'0')));let calls=0;
 const controller=createReferencePageController(async(query,signal)=>{calls++;assert.equal(query.filterId,'active');assert.equal(signal.aborted,false);const matching=data.filter(row=>row.name.includes(query.search));return{rows:matching.slice(query.page*query.pageSize,(query.page+1)*query.pageSize),total:matching.length,page:query.page+1,pageSize:query.pageSize};});
 assert.equal(calls,0);controller.start();try{await settled(controller);assert.equal(calls,1);assert.equal(controller.snapshot().rows.length,25);assert.equal(controller.snapshot().total,5000);assert.ok(Buffer.byteLength(JSON.stringify(controller.snapshot().rows))<8192);
  controller.change({...controller.snapshot().query,search:'r0005000'},'search');assert.deepEqual(controller.snapshot().rows,[]);await delay(225);await settled(controller);assert.deepEqual(controller.snapshot().rows.map(row=>row.public_id),['r0005000']);assert.equal(controller.snapshot().total,1);
 }finally{controller.stop();}
});

test('reference page rejects inactive and oversized choice responses',async()=>{
 for(const rows of [[record('aaaaaaaa',false)],Array.from({length:5000},()=>record('aaaaaaaa'))]){
  const controller=createReferencePageController(async()=>({rows,total:5000,page:1,pageSize:25}));controller.start();try{await settled(controller);assert.ok(controller.snapshot().error);assert.deepEqual(controller.snapshot().rows,[]);}finally{controller.stop();}
 }
});

test('historical inactive selection resolves singly without loading a catalogue',async()=>{
 const calls:string[]=[];const controller=createSelectedReferenceController(async(id,signal)=>{calls.push(id);assert.equal(signal.aborted,false);return record(id,false);});
 try{controller.change('aaaaaaaa');await settled(controller);assert.deepEqual(calls,['aaaaaaaa']);assert.equal(controller.snapshot().record?.active,false);assert.equal(controller.snapshot().record?.name,'Reference aaaaaaaa');controller.change('');assert.equal(controller.snapshot().record,undefined);assert.equal(calls.length,1);}finally{controller.stop();}
});

test('selected ID changes, scope cleanup and late results cannot replace the current authorized label',async()=>{
 let resolveFirst:(row:ReferenceRecord)=>void=()=>{},firstSignal:AbortSignal|undefined;
 const controller=createSelectedReferenceController(async(id,signal)=>{if(id==='aaaaaaaa'){firstSignal=signal;return new Promise(resolve=>{resolveFirst=resolve;});}return record(id);});
 controller.change('aaaaaaaa');controller.change('bbbbbbbb');try{await settled(controller);assert.equal(firstSignal?.aborted,true);resolveFirst(record('aaaaaaaa'));await delay(10);assert.equal(controller.snapshot().record?.public_id,'bbbbbbbb');controller.stop();assert.equal(controller.snapshot().record,undefined);}finally{controller.stop();}
});

test('missing or forbidden selections never fall back to an apparently authorized ID label or retry automatically',async()=>{
 for(const status of [401,403,404]){let calls=0;const controller=createSelectedReferenceController(async()=>{calls++;throw new ReferenceRequestError('Selection denied',status);});
  try{controller.change('aaaaaaaa');await settled(controller);assert.equal(controller.snapshot().record,undefined);assert.equal(controller.snapshot().error,'Selection denied');await delay(20);assert.equal(calls,1);controller.change('aaaaaaaa');await settled(controller);assert.equal(calls,2);}finally{controller.stop();}
 }
 const mismatched=createSelectedReferenceController(async()=>record('bbbbbbbb'));try{mismatched.change('aaaaaaaa');await settled(mismatched);assert.match(mismatched.snapshot().error,/invalid record/);assert.equal(mismatched.snapshot().record,undefined);}finally{mismatched.stop();}
});

test('reference transport fixes active scope, preserves cancellation and validates selected response identity',async()=>{
 const original=globalThis.fetch,calls:{path:string;options:RequestInit|undefined}[]=[];let body:unknown={rows:[record('aaaaaaaa')],total:5000,page:2,pageSize:25};let status=200;
 globalThis.fetch=async(path,options)=>{calls.push({path:String(path),options});return Response.json(body,{status});};
 try{
  const controller=new AbortController();await loadReferencePage('product-types',{page:1,pageSize:25,search:'beyond',sort:null,filters:{},filterId:'inactive'},controller.signal);
  const query=new URL(calls[0].path,'http://fixture').searchParams;assert.equal(query.get('filterId'),'active');assert.equal(query.get('page'),'2');assert.equal(calls[0].options?.signal,controller.signal);
  body=record('aaaaaaaa',false);const selected=await loadSelectedReference('product-types','aaaaaaaa');assert.equal(selected.active,false);assert.equal(calls[1].path,'/platform-api/v1/gateway/core-app/product-types/aaaaaaaa');
  body=record('bbbbbbbb');await assert.rejects(loadSelectedReference('product-types','aaaaaaaa'),/invalid record/);
  body={message:'Forbidden'};status=403;await assert.rejects(loadSelectedReference('product-types','aaaaaaaa'),error=>error instanceof ReferenceRequestError&&error.statusCode===403);
 }finally{globalThis.fetch=original;}
});
