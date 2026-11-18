import test from 'node:test';import assert from 'node:assert/strict';
import {createApplication} from '../src/api/app.ts';
test('Platform owns Core login and binds existing data to one verified tenant',async()=>{
 const values={CORE_APP_PLATFORM_AUTH:'1',CORE_APP_PLATFORM_ORIGIN:'http://127.0.0.1:4385',CORE_APP_PLATFORM_SERVICE_ID:'service1',CORE_APP_PLATFORM_SERVICE_TOKEN:'a'.repeat(64),CORE_APP_BROWSER_ORIGINS:'["http://127.0.0.1:4340"]',CORE_APP_PLATFORM_TENANT_ID:'tenant01',CORE_APP_DATA_TENANT_KEY:'existing-tenant'};
 const original=globalThis.fetch;let tenantId='tenant01';globalThis.fetch=async()=>Response.json({version:1,tenantId,userId:'account1',sessionId:'session1',appKey:'core-app',serviceId:'service1',realm:'sa',permissions:['core-app/workspace:read'],requestId:'b'.repeat(32)});
 const app=createApplication({} as never,values);const headers={'x-platform-grant':'tenant01.'+'c'.repeat(64)};
 try{
  assert.equal((await app.inject({url:'/api/v1/session',headers:{cookie:'core_app_session=legacy',authorization:'Bearer forged'}})).statusCode,401);
  let response=await app.inject({url:'/api/v1/session',headers});assert.equal(response.statusCode,200);assert.equal(response.json().localAccess,false);assert.equal(response.json().context.tenantId,'existing-tenant');assert.equal(response.json().context.actorId,'tenant01:account1');
  assert.equal((await app.inject({url:'/api/v1/countries',headers})).statusCode,403,'role alone cannot read Core data');
  assert.equal((await app.inject({method:'POST',url:'/api/v1/session',headers,payload:{local:true}})).statusCode,404);
  tenantId='tenant02';assert.equal((await app.inject({url:'/api/v1/session',headers})).statusCode,403);
 }finally{await app.close();globalThis.fetch=original;}
});
