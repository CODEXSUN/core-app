import test from 'node:test';
import assert from 'node:assert/strict';
import {setTimeout as delay} from 'node:timers/promises';
import {createCoreRemoteList,coreListQuery} from '../src/web/modules/shared/remote-module-list.ts';

const page=(rows:unknown[],total=rows.length,page=1,pageSize=25)=>Response.json({rows,total,page,pageSize});
async function settled(controller:ReturnType<typeof createCoreRemoteList>){for(let i=0;i<100&&controller.snapshot().loading;i++)await delay(5);assert.equal(controller.snapshot().loading,false);}

test('remote query uses bounded server page intent and preserves authoritative returned row order',async()=>{
 const calls:string[]=[];const controller=createCoreRemoteList<{public_id:string;name:string}>('contacts',async path=>{calls.push(path);return page([{public_id:'aaaaaaaa',name:'Zed'},{public_id:'bbbbbbbb',name:'Alpha'}],5000,2,100);});
 controller.change({...controller.snapshot().query,page:1,pageSize:100,search:'not-local-match',sort:{id:'name',direction:'desc'},filterId:'active',filters:{role:'both'}},'page');
 controller.start();try{await settled(controller);assert.equal(calls.length,1);const params=new URL(calls[0],'http://fixture').searchParams;assert.equal(params.get('page'),'2');assert.equal(params.get('pageSize'),'100');assert.equal(params.get('q'),'not-local-match');assert.equal(params.get('filters'),'{"role":"both"}');assert.deepEqual(controller.snapshot().rows.map(row=>row.name),['Zed','Alpha']);assert.equal(controller.snapshot().total,5000);}finally{controller.stop();}
});

test('new intent immediately clears stale rows, aborts superseded work and ignores late responses',async()=>{
 let calls=0;let resolveOld:(value:Response)=>void=()=>{};let oldSignal:AbortSignal|undefined;
 const controller=createCoreRemoteList<{public_id:string}>('products',async(_path,{signal})=>{calls++;if(calls===1)return page([{public_id:'initial1'}],5000);if(calls===2){oldSignal=signal;return new Promise(resolve=>{resolveOld=resolve;});}return page([{public_id:'latest01'}],1,3);});
 controller.start();try{await settled(controller);controller.change({...controller.snapshot().query,page:1},'page');assert.deepEqual(controller.snapshot().rows,[]);assert.equal(controller.snapshot().total,null);controller.change({...controller.snapshot().query,page:2},'page');assert.equal(oldSignal?.aborted,true);await settled(controller);resolveOld(page([{public_id:'stale001'}],5000,2));await delay(10);assert.deepEqual(controller.snapshot().rows,[{public_id:'latest01'}]);}finally{controller.stop();}
});

test('typing coalesces requests and stop cancels a pending debounce',async()=>{
 let calls=0;const controller=createCoreRemoteList('contacts',async()=>{calls++;return page([],0);});controller.start();await settled(controller);
 controller.change({...controller.snapshot().query,search:'a'},'search');controller.change({...controller.snapshot().query,search:'ab'},'search');controller.change({...controller.snapshot().query,search:'abc'},'search');assert.equal(calls,1);await delay(240);await settled(controller);assert.equal(calls,2);
 controller.change({...controller.snapshot().query,search:'cancel'},'search');controller.stop();await delay(240);assert.equal(calls,2);
});

test('503 retries only explicitly at the same page; 401/403 never auto-loop',async()=>{
 for(const status of [503,401,403]){
  let calls=0;const controller=createCoreRemoteList('contacts',async()=>{calls++;return calls===1?Response.json({message:'Denied or temporarily unavailable'},{status}):page([],5000,4);});
  controller.change({...controller.snapshot().query,page:3},'page');controller.start();try{await settled(controller);assert.equal(controller.snapshot().errorStatus,status);assert.deepEqual(controller.snapshot().rows,[]);await delay(25);assert.equal(calls,1);controller.retry();await settled(controller);assert.equal(calls,2);assert.equal(controller.snapshot().query.page,3);assert.equal(controller.snapshot().error,'');}finally{controller.stop();}
 }
});

test('invalid or oversized response metadata never exposes rows',async()=>{
 for(const body of [{rows:Array(101).fill({}),total:5000,page:1,pageSize:25},{rows:[{}],total:-1,page:1,pageSize:25},{rows:[],total:5000,page:2,pageSize:25},{rows:[],total:5000,page:1,pageSize:100}]){
  const controller=createCoreRemoteList('contacts',async()=>Response.json(body));controller.start();try{await settled(controller);assert.match(controller.snapshot().error,/metadata/);assert.deepEqual(controller.snapshot().rows,[]);assert.equal(controller.snapshot().total,null);}finally{controller.stop();}
 }
 const base={page:0,pageSize:25,search:'',sort:null,filters:{},filterId:null} as const;
 assert.throws(()=>coreListQuery({...base,page:-1}));assert.throws(()=>coreListQuery({...base,pageSize:1000} as any));
});

test('unmounted requests and StrictMode-style restart cannot write stale state',async()=>{
 let resolveFirst:(value:Response)=>void=()=>{};let calls=0;
 const controller=createCoreRemoteList('contacts',async()=>{calls++;return calls===1?new Promise(resolve=>{resolveFirst=resolve;}):page([{public_id:'current1'}],1);});
 controller.start();controller.stop();controller.start();try{await settled(controller);resolveFirst(page([{public_id:'stale001'}],1));await delay(10);assert.deepEqual(controller.snapshot().rows,[{public_id:'current1'}]);}finally{controller.stop();}
});
