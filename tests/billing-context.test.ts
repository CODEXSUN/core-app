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
