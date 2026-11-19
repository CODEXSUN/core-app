import test from 'node:test';
import assert from 'node:assert/strict';
import {createHttpServer} from '@workspace/framework';
import {registerBillingContextRoutes} from '../src/api/integrations/billing/routes.ts';
import type {ModuleContext} from '../src/api/database/context.ts';

test('aggregate denies a missing constituent permission before storage access',async()=>{
 const app=createHttpServer({name:'aggregate-denial',logLevel:'silent'});
 const permissions=['master/default-company:read','master/company:read','master/financial-year:read','master/contact:read','master/product:read','common/currency:read'];
 let current:ModuleContext|null=null;
 const db=new Proxy({},{get(){throw Error('Denied calls must not access storage');}});
 registerBillingContextRoutes(app,db as any,async()=>current);
 try{
  assert.equal((await app.inject('/api/v1/billing-context')).statusCode,401);
  for(const missing of permissions){
   current={actorId:'test',tenantId:'tenant-a',permissions:permissions.filter(value=>value!==missing)};
   assert.equal((await app.inject('/api/v1/billing-context')).statusCode,403,missing);
  }
 }finally{await app.close();}
});

test('bounded bootstrap and lookup permissions fail before accessing storage',async()=>{
 const app=createHttpServer({name:'catalogue-denial',logLevel:'silent'});let current:ModuleContext|null=null;
 const db=new Proxy({},{get(){throw Error('Denied calls must not access storage');}});registerBillingContextRoutes(app,db as any,async()=>current);
 try{
  for(const url of ['/api/v1/billing-bootstrap','/api/v1/billing-lookups/contacts','/api/v1/billing-lookups/products','/api/v1/billing-lookups/contacts/aaaaaaaa','/api/v1/billing-lookups/products/aaaaaaaa'])assert.equal((await app.inject(url)).statusCode,401);
  current={actorId:'test',tenantId:'tenant-a',permissions:[]};
  for(const url of ['/api/v1/billing-bootstrap','/api/v1/billing-lookups/contacts','/api/v1/billing-lookups/products','/api/v1/billing-lookups/contacts/aaaaaaaa','/api/v1/billing-lookups/products/aaaaaaaa'])assert.equal((await app.inject(url)).statusCode,403);
 }finally{await app.close();}
});
