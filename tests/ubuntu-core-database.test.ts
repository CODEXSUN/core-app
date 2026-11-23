import test from 'node:test';import assert from 'node:assert/strict';
import {prepareCoreFreshDatabase,grantCoreRuntime,coreRuntimeTables} from '../.container/ubuntu/database.mjs';
function fixture({existing=false,persistFails=false,ddlFails=false}={}){
 const events:any[]=[];class Client{config:any;constructor(config:any){this.config=config;}async connect(){events.push({connect:this.config.database??'postgres'});}async end(){events.push({end:this.config.database??'postgres'});}async query(sql:string){events.push({sql});if(sql.startsWith('SELECT 1 FROM pg_database'))return{rowCount:existing?1:0,rows:[]};if(ddlFails&&sql.startsWith('CREATE DATABASE'))throw Error('provision interrupted');return{rowCount:0,rows:[]};}}
 const env:any={CORE_APP_DATABASE_URL:'postgresql://app_core_app:approved%27private@127.0.0.1:5433/app_core_app',CORE_APP_LOCAL_ACCESS:'true',CORE_APP_API_CLIENTS:'[1]'};
 const persist=async()=>{events.push({persist:true});if(persistFails)throw Error('encrypted persistence unavailable');};
 return{events,env,persist,dependencies:{Client,randomBytes:()=>Buffer.alloc(32,7)}};
}
test('fresh callback reuses approved runtime credential, persists distinct migrator before DDL and creates no business data',async()=>{
 const h=fixture();await prepareCoreFreshDatabase({database:'postgres'},h.env,h.persist,h.dependencies);
 const runtime=new URL(h.env.CORE_APP_DATABASE_URL),migration=new URL(h.env.CORE_APP_MIGRATION_DATABASE_URL);assert.equal(runtime.username,'app_core_app');assert.equal(decodeURIComponent(runtime.password),"approved'private");assert.equal(runtime.hostname,'postgres');assert.equal(migration.username,'app_core_app_migrator');assert.notEqual(runtime.password,migration.password);assert.equal(h.env.CORE_APP_LOCAL_ACCESS,'false');assert.equal(h.env.CORE_APP_API_CLIENTS,'[]');
 assert.ok(h.events.findIndex(e=>e.persist)<h.events.findIndex(e=>e.sql?.startsWith('CREATE ROLE')));const sql=h.events.filter(e=>e.sql).map(e=>e.sql).join('\n');assert.match(sql,/NOSUPERUSER NOCREATEDB NOCREATEROLE NOBYPASSRLS/);assert.match(sql,/OWNER app_core_app_migrator/);assert.match(sql,/approved''private/);assert.ok(!/INSERT|COPY|pg_dump|pg_restore|DROP|TRUNCATE|\.env/.test(sql));
});
test('retained database or either old/new runtime role prevents fresh adoption and persistence',async()=>{const h=fixture({existing:true});await assert.rejects(prepareCoreFreshDatabase({},h.env,h.persist,h.dependencies),/recovery/);assert.ok(!h.events.some(e=>e.persist||e.sql?.startsWith('CREATE')));assert.equal(h.events.at(-1).end,'postgres');});
test('persistence failure causes no DDL, provisioning failure retains recovery and never drops partial state',async()=>{
 for(const flags of [{persistFails:true},{ddlFails:true}]){const h=fixture(flags);await assert.rejects(prepareCoreFreshDatabase({},h.env,h.persist,h.dependencies));const sql=h.events.filter(e=>e.sql).map(e=>e.sql).join('\n');assert.ok(!/DROP|ROLLBACK|TRUNCATE/.test(sql));if(flags.persistFails)assert.ok(!sql.includes('CREATE ROLE'));assert.equal(h.events.at(-1).end,'postgres');}
});
test('infrastructure/native/foreign/mismatched migration scopes are rejected before any connection',async()=>{
 for(const url of ['postgresql://postgres:p@postgres:5432/app_core_app','postgresql://app_core_app:p@postgres:5432/codexsun_db','postgresql://app_core_app:p@remote:5432/app_core_app','postgresql://app_core_app:@postgres:5432/app_core_app']){const h=fixture();h.env.CORE_APP_DATABASE_URL=url;await assert.rejects(prepareCoreFreshDatabase({},h.env,h.persist,h.dependencies));assert.deepEqual(h.events,[]);}
 const h=fixture();h.env.CORE_APP_MIGRATION_DATABASE_URL='postgresql://app_core_app:p@postgres:5432/app_core_app';await assert.rejects(prepareCoreFreshDatabase({},h.env,h.persist,h.dependencies));assert.deepEqual(h.events,[]);
});
test('runtime grants cover exactly37 owned tables and history is SELECT-only, without schema-create or migrator membership',async()=>{
 const h=fixture();h.env.CORE_APP_DATABASE_URL='postgresql://app_core_app:private@postgres:5432/app_core_app';await grantCoreRuntime({},h.env,h.dependencies);assert.equal(coreRuntimeTables.length,37);const sql=h.events.filter(e=>e.sql).map(e=>e.sql).join('\n');assert.match(sql,/GRANT SELECT,INSERT,UPDATE,DELETE ON /);assert.match(sql,/GRANT SELECT ON kysely_migration/);assert.ok(!/CREATE|ALTER|DROP|TRUNCATE|GRANT ALL|app_core_app_migrator|kysely_migration_lock/.test(sql));assert.ok(h.events.filter(e=>e.connect).every(e=>e.connect==='app_core_app'));
});
