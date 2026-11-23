import test from 'node:test';import assert from 'node:assert/strict';
import {createHttpServer} from '@workspace/framework';
import {registerPlatformServiceInfo} from '@workspace/sdk/platform-application';
import {coreSchemaReady} from '../src/api/modules/register.ts';
import {registerBillingContextRoutes} from '../src/api/integrations/billing/routes.ts';
import {ownerPermissions} from '../contracts/permissions.ts';
function emptyDatabase({references=false,fail=false}={}){
 const reads:string[]=[];
 const db={selectFrom(table:string){reads.push(table);const chain:any=new Proxy({}, {get(_target,key){if(key==='execute')return async()=>{if(fail)throw Error('table missing');return [];};if(key==='executeTakeFirst')return async()=>references&&['units','currencies','taxes'].includes(table)?{public_id:'newref01'}:undefined;return()=>chain;}});return chain;}};
 return{db:db as any,reads};
}
test('migrated empty Core is technically ready and advertises the new target tenant without organisation defaults',async()=>{
 const {db,reads}=emptyDatabase();const app=createHttpServer({name:'core-app',logLevel:'silent',readinessChecks:[()=>coreSchemaReady(db)]});
 registerPlatformServiceInfo(app,{appKey:'core-app',version:'0.1.7',databaseScope:'existing-tenant',tenantId:'newtn001'});
 try{const ready=await app.inject('/api/ready');assert.equal(ready.statusCode,200,ready.body);assert.equal(ready.json().ready,true);assert.ok(reads.includes('companies')&&reads.includes('financial_years')&&reads.includes('default_companies'));const info=await app.inject('/api/service-info');assert.equal(info.statusCode,200,info.body);assert.equal(info.json().tenantId,'newtn001');}finally{await app.close();}
});
test('missing schema remains unavailable rather than being confused with empty business setup',async()=>{const {db}=emptyDatabase({fail:true});assert.equal(await coreSchemaReady(db),false);});
test('fresh reference-only Core reports business setup incomplete and bounded bootstrap404; permissions remain enforced',async()=>{
 const {db}=emptyDatabase({references:true});let permissions:readonly string[]=ownerPermissions;
 const app=createHttpServer({name:'core-app',logLevel:'silent'});registerBillingContextRoutes(app,db,async()=>({actorId:'newactor',tenantId:'ubuntu:new-tenant',permissions}));
 try{const status=await app.inject('/api/v1/billing-setup-status');assert.equal(status.statusCode,200,status.body);assert.deepEqual(status.json(),{organisationReady:false,references:{units:true,currencies:true,taxes:true}});const bootstrap=await app.inject('/api/v1/billing-bootstrap?currencyCodes=INR');assert.equal(bootstrap.statusCode,404,bootstrap.body);permissions=[];assert.equal((await app.inject('/api/v1/billing-setup-status')).statusCode,403);assert.equal((await app.inject('/api/v1/billing-bootstrap?currencyCodes=INR')).statusCode,403);}finally{await app.close();}
});
