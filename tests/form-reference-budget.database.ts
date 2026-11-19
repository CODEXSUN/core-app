import test from'node:test';
import assert from'node:assert/strict';
import{sql}from'kysely';
import{writeFileSync,mkdirSync}from'node:fs';
import path from'node:path';
import{withTestDatabase}from'./database-harness.ts';

test('measure the seven ProductForm foreign bulk collections against real5000-row fixtures',{timeout:180000},async t=>{
 await withTestDatabase(async({db,app,reader})=>{
  const baseName='Industrial Textile Manufacturing Product Reference Classification ';
  for(const[table,prefix]of[['product_types','t'],['product_categories','c'],['product_groups','g'],['units','u']]as const)await sql`INSERT INTO ${sql.table(table)}(public_id,tenant_id,name,sort_order,created_by,updated_by) SELECT ${prefix}||lpad(n::text,7,'0'),'tenant-a',${baseName}||lpad(n::text,5,'0'),0,'test:fixture','test:fixture' FROM generate_series(1,5000) n`.execute(db);
  await sql`INSERT INTO hsn_codes(public_id,tenant_id,name,code,description,sort_order,created_by,updated_by) SELECT 'h'||lpad(n::text,7,'0'),'tenant-a',${baseName}||lpad(n::text,5,'0'),'HSN-'||n,'Standard textile classification',0,'test:fixture','test:fixture' FROM generate_series(1,5000) n`.execute(db);
  await sql`INSERT INTO taxes(public_id,tenant_id,name,rate_percent,description,sort_order,created_by,updated_by) SELECT 'x'||lpad(n::text,7,'0'),'tenant-a',${baseName}||lpad(n::text,5,'0'),n::numeric/100,'Standard textile tax reference',0,'test:fixture','test:fixture' FROM generate_series(1,5000) n`.execute(db);
  await sql`INSERT INTO brands(public_id,tenant_id,name,logo_url,logo_alt,show_on_storefront,sort_order,created_by,updated_by) SELECT 'b'||lpad(n::text,7,'0'),'tenant-a',${baseName}||lpad(n::text,5,'0'),'','',false,0,'test:fixture','test:fixture' FROM generate_series(1,5000) n`.execute(db);
  const collections=['product-types','product-categories','product-groups','hsn-codes','units','taxes','brands'];
  const rows=[],fixtures=[];for(const collection of collections){const response=await app.inject({url:'/api/v1/'+collection,headers:reader});assert.equal(response.statusCode,200);assert.equal(response.json().length,5000);const page=await app.inject({url:'/api/v1/'+collection+'/page?pageSize=25&filterId=active',headers:reader});assert.equal(page.statusCode,200,page.body);assert.equal(page.json().total,5000);assert.equal(page.json().rows.length,25);rows.push({collection,rows:5000,nameChars:baseName.length+5,bulkBytes:Buffer.byteLength(response.body),page25Bytes:Buffer.byteLength(page.body),bulkOverGateway:Buffer.byteLength(response.body)>1048576});fixtures.push({profile:'reference-'+collection,body:response.json()});}
  t.diagnostic(JSON.stringify(rows));t.diagnostic('ProductForm Promise.all bulk total bytes: '+rows.reduce((sum,row)=>sum+row.bulkBytes,0));
  if(process.env.CORE_CATALOG_AUDIT_DIR){const dir=path.resolve(process.env.CORE_CATALOG_AUDIT_DIR);mkdirSync(dir,{recursive:true});writeFileSync(path.join(dir,'core-form-reference-gateway-fixtures.json'),JSON.stringify(fixtures));writeFileSync(path.join(dir,'core-form-reference-measurements.json'),JSON.stringify(rows,null,2));}
 });
});
