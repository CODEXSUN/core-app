import test from 'node:test';
import assert from 'node:assert/strict';
import {sql} from 'kysely';
import {writeFileSync,mkdirSync} from 'node:fs';
import path from 'node:path';
import {withTestDatabase,companyValues,financialYearValues} from './database-harness.ts';
import {createHttpServer} from '@workspace/framework';
import {registerBillingContextRoutes} from '../src/api/integrations/billing/routes.ts';
import {ownerPermissions} from '../contracts/permissions.ts';
import type {ModuleContext} from '../src/api/database/context.ts';

test('5000-contact/product catalogues remain searchable, scoped and bounded without truncating legacy contracts',{timeout:180000},async t=>{
 await withTestDatabase(async({db,app,headersA,headersB,reader})=>{
  const create=async(collection:string,payload:unknown)=>{const result=await app.inject({method:'POST',url:'/api/v1/'+collection,headers:headersA,payload});assert.equal(result.statusCode,201,result.body);return result.json();};
  const company=await create('companies',companyValues),year=await create('financial-years',financialYearValues);
  await create('default-companies',{name:'Catalogue default',companyId:company.public_id,financialYearId:year.public_id,landingApp:'billing',active:true});
  const unit=await create('units',{name:'Metre',active:true});
  const unitRow=await db.selectFrom('units').select('id').where('public_id','=',unit.public_id).executeTakeFirstOrThrow();
  for(const name of ['INR','USD','EUR'])await create('currencies',{name,symbol:name==='INR'?'₹':'$',active:true});
  await sql`INSERT INTO contacts(public_id,tenant_id,name,code,legal_name,role,gstin,pan,website,description,emails,phones,addresses,created_by,updated_by)
    SELECT 'c'||lpad(n::text,7,'0'),'tenant-a','North Coast Industrial Textile Distribution and Manufacturing Customer '||lpad(n::text,5,'0'),'C-'||n,'Catalogue customer','customer','','','','','[]'::jsonb,'[]'::jsonb,'[]'::jsonb,'test:fixture','test:fixture' FROM generate_series(1,5000) n`.execute(db);
  await sql`INSERT INTO products(public_id,tenant_id,name,unit_id,opening_stock,opening_rate,description,created_by,updated_by)
    SELECT 'p'||lpad(n::text,7,'0'),'tenant-a','Premium Extra Long Staple Combed Organic Cotton Twill Fabric Natural White Roll '||lpad(n::text,5,'0'),${unitRow.id},0,0,'Catalogue item','test:fixture','test:fixture' FROM generate_series(1,5000) n`.execute(db);
  const get=(url:string,headers=reader)=>app.inject({url:'/api/v1/'+url,headers});
  const incomplete=await get('billing-setup-status');assert.equal(incomplete.statusCode,200,incomplete.body);assert.deepEqual(incomplete.json(),{organisationReady:true,references:{units:true,currencies:true,taxes:false}});
  await create('taxes',{name:'GST 5%',ratePercent:'5.0000',active:true});
  assert.deepEqual((await get('billing-setup-status')).json(),{organisationReady:true,references:{units:true,currencies:true,taxes:true}});
  assert.deepEqual((await get('billing-setup-status',headersB)).json(),{organisationReady:false,references:{units:false,currencies:false,taxes:false}},'setup booleans never borrow another tenant');
  const permissionApp=createHttpServer({name:'setup-permission-fixture',logLevel:'silent'});let current:ModuleContext={actorId:'test:fixture',tenantId:'tenant-a',permissions:[...ownerPermissions]};registerBillingContextRoutes(permissionApp,db,async()=>current);
  try{
   for(const missing of ['master/default-company:read','master/company:read','master/financial-year:read','common/unit:read','common/currency:read','common/tax:read']){current={actorId:'test:fixture',tenantId:'tenant-a',permissions:ownerPermissions.filter(value=>value!==missing)};assert.equal((await permissionApp.inject('/api/v1/billing-setup-status')).statusCode,403,missing);}
   current={actorId:'test:fixture',tenantId:'tenant-b',permissions:ownerPermissions.filter(value=>!['master/company:read','master/financial-year:read'].includes(value))};assert.equal((await permissionApp.inject('/api/v1/billing-setup-status')).statusCode,200,'original missing-default branch does not newly require company/year permissions');
   current={actorId:'test:fixture',tenantId:'tenant-a',permissions:ownerPermissions.filter(value=>!['master/contact:read','master/product:read'].includes(value))};assert.equal((await permissionApp.inject('/api/v1/billing-setup-status')).statusCode,200,'setup does not add catalogue rights');
  }finally{await permissionApp.close();}
  const bootstrap=await get('billing-bootstrap?currencyCodes=INR,USD');assert.equal(bootstrap.statusCode,200,bootstrap.body);assert.equal(bootstrap.json().currencies.length,2);assert.ok(!('contacts'in bootstrap.json())&&!('products'in bootstrap.json()));assert.ok(Buffer.byteLength(bootstrap.body)<8192);
  assert.equal((await get('billing-bootstrap')).json().currencies.length,0,'no implicit unbounded currency list');
  assert.equal((await get('billing-bootstrap?currencyCodes=ZZZ')).json().currencies.length,0,'missing currency is not fabricated');
  await db.updateTable('currencies').set({active:false}).where('name','=','USD').where('tenant_id','=','tenant-a').execute();assert.equal((await get('billing-bootstrap?currencyCodes=INR,USD')).json().currencies.length,1,'inactive currencies are not offered');await db.updateTable('currencies').set({active:true}).where('name','=','USD').where('tenant_id','=','tenant-a').execute();
  for(const query of ['currencyCodes=INR,INR','currencyCodes=inr','currencyCodes=AAA,AAB,AAC,AAD,AAE,AAF,AAG,AAH,AAI,AAJ,AAK','tenantId=tenant-b'])assert.equal((await get('billing-bootstrap?'+query)).statusCode,400,query);
  for(const collection of ['contacts','products']){
   const url='billing-lookups/'+collection;const first=await get(url+'?pageSize=100');assert.equal(first.statusCode,200,first.body);assert.equal(first.json().total,5000);assert.equal(first.json().rows.length,100);assert.ok(Buffer.byteLength(first.body)<32768);
   const second=await get(url+'?page=2&pageSize=100');assert.equal(second.json().rows.length,100);assert.ok(!second.json().rows.some((row:any)=>first.json().rows.some((first:any)=>first.public_id===row.public_id)));
   const beyond=await get(url+'?q=05000');assert.equal(beyond.json().total,1,'server search reaches beyond initial page');assert.equal(beyond.json().rows[0].public_id,collection==='contacts'?'c0005000':'p0005000');
   assert.equal((await get(url+'?q=%')).json().total,0,'search wildcard characters are literal');
   assert.equal((await get(url,headersB)).json().total,0,'foreign tenant filtering precedes count and paging');
   const selected=collection==='contacts'?'c0005000':'p0005000';assert.equal((await get(url+'/'+selected)).statusCode,200);assert.equal((await get(url+'/'+selected,headersB)).statusCode,404);
   for(const query of ['page=0','page=-1','page=1.5','pageSize=101','pageSize=0','sort=desc','tenantId=tenant-b','q='+('a'.repeat(81))])assert.equal((await get(url+'?'+query)).statusCode,400,query);
   assert.equal((await get(url+'/invalid')).statusCode,400);assert.equal((await get(url+'/'+selected+'?tenantId=tenant-b')).statusCode,400);
   await db.updateTable(collection).set({active:false}).where('public_id','=',selected).execute();assert.equal((await get(url+'/'+selected)).statusCode,404);await db.updateTable(collection).set({active:true}).where('public_id','=',selected).execute();
   await db.updateTable(collection).set({deleted_at:new Date()}).where('public_id','=',selected).execute();assert.equal((await get(url+'/'+selected)).statusCode,404);await db.updateTable(collection).set({deleted_at:null}).where('public_id','=',selected).execute();
  }
  await db.updateTable('contacts').set({role:'both'}).where('public_id','=','c0000001').execute();await db.updateTable('contacts').set({role:'supplier'}).where('public_id','=','c0000002').execute();assert.equal((await get('billing-lookups/contacts?role=customer')).json().total,4999);assert.equal((await get('billing-lookups/contacts?role=supplier')).json().total,2);await db.updateTable('contacts').set({role:'customer'}).where('public_id','in',['c0000001','c0000002']).execute();
  await db.updateTable('units').set({active:false}).where('id','=',unitRow.id).execute();assert.equal((await get('billing-lookups/products/p0005000')).statusCode,404,'inactive unit reference is not a new selectable product');assert.equal((await get('billing-lookups/products')).json().total,0);await db.updateTable('units').set({active:true}).where('id','=',unitRow.id).execute();
  await db.updateTable('contacts').set({name:'Duplicate sort label'}).where('public_id','in',['c0000001','c0000002']).execute();const ties=await get('billing-lookups/contacts?q=Duplicate%20sort%20label');assert.deepEqual(ties.json().rows.map((row:any)=>row.public_id),['c0000001','c0000002']);await db.updateTable('contacts').set({name:sql`'North Coast Industrial Textile Distribution and Manufacturing Customer '||lpad(right(public_id,7)::integer::text,5,'0')`}).where('public_id','in',['c0000001','c0000002']).execute();
  const aggregate=await get('billing-context');assert.equal(aggregate.statusCode,200,aggregate.body.slice(0,300));const bulk=aggregate.json();assert.equal(bulk.contacts.length,5000);assert.equal(bulk.products.length,5000,'legacy contract is not silently truncated');
  const oldProjection={scope:{company:company.public_id,year:year.public_id,permissions:['billing/sale:read']},company:{name:company.name},year:{name:year.name,startDate:year.startDate,endDate:year.endDate},contacts:bulk.contacts.map((v:any)=>({public_id:v.public_id,name:v.name,role:v.role})),products:bulk.products.map((v:any)=>({public_id:v.public_id,name:v.name,unitName:v.unitName})),currencies:bulk.currencies.filter((v:any)=>['INR','USD'].includes(v.name)).map((v:any)=>({public_id:v.public_id,name:v.name,code:v.name}))};
  const bulkBytes=Buffer.byteLength(aggregate.body),outerBytes=Buffer.byteLength(JSON.stringify(oldProjection));assert.ok(outerBytes>1048576,'real database fixture reproduces the former outer gateway size failure');
  const contactPage=await get('billing-lookups/contacts?pageSize=100'),productPage=await get('billing-lookups/products?pageSize=100');
  const burstStart=performance.now();
  const burst=await Promise.all(Array.from({length:120},(_,index)=>get('billing-lookups/'+(index%2?'contacts':'products')+'?pageSize=100&page='+(1+index%4),index%3?reader:headersB)));
  for(let index=0;index<burst.length;index++){const response=burst[index];assert.equal(response.statusCode,200,response.body);assert.equal(response.json().total,index%3?5000:0);assert.ok(response.json().rows.length<=100);assert.ok(Buffer.byteLength(response.body)<32768);}
  t.diagnostic('120 parallel bounded tenant-scoped SQL lookup requests completed in '+Math.round(performance.now()-burstStart)+'ms; Core fixture auth, not production gateway throughput.');
  const plan=await sql<any>`EXPLAIN (ANALYZE, FORMAT JSON) SELECT public_id,name FROM contacts WHERE tenant_id='tenant-a' AND deleted_at IS NULL AND active=true AND name ILIKE '%05000%' ORDER BY name,public_id LIMIT 100`.execute(db);t.diagnostic('5000-contact bounded search execution ms: '+plan.rows[0]['QUERY PLAN'][0]['Execution Time']);
  t.diagnostic(JSON.stringify({realDatabaseFixture:true,contacts:5000,products:5000,legacyCoreBytes:bulkBytes,legacyBillingProjectionBytes:outerBytes,bootstrapBytes:Buffer.byteLength(bootstrap.body),contactPage100Bytes:Buffer.byteLength(contactPage.body),productPage100Bytes:Buffer.byteLength(productPage.body)}));
  if(process.env.CORE_CATALOG_AUDIT_DIR){const dir=path.resolve(process.env.CORE_CATALOG_AUDIT_DIR);mkdirSync(dir,{recursive:true});writeFileSync(path.join(dir,'core-catalog-gateway-fixtures.json'),JSON.stringify([{profile:'legacy-long',body:oldProjection},{profile:'bootstrap',body:bootstrap.json()},{profile:'contacts-page',body:contactPage.json()},{profile:'products-page',body:productPage.json()}]));}
 });
});
