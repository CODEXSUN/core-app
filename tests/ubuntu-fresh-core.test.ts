import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {coreUbuntuRelease,prepareFreshCoreDatabase,validateCoreFreshTarget} from '../.container/ubuntu/fresh-database.mjs';
const artifact=JSON.parse(readFileSync(new URL('./fixtures/core-0.1.7-public-manifest.json',import.meta.url),'utf8'));
const target={id:'ubuntu-lan',host:'192.168.1.34',root:'/srv/codebiz',state:'/srv/codebiz/state',hostname:'cxserver',operator:'/srv/codebiz/operators/v-1.0.21/devkit/codeship',lock:'/srv/codebiz/state/devkits/operation.lock',binding:'127.0.0.1',publicExposure:false,dataPolicy:'fresh'};
const options=()=>({target:{...target},manifest:structuredClone(artifact),platform:'linux',hostname:'cxserver',appRoot:target.operator,mode:'setup',prior:undefined,dataTenantKey:'ubuntu:tenant-new'});
function harness(patch:any={}){
 const calls:any[]=[];const names=validateCoreFreshTarget(options());let plans=0;
 const seeds=[...new Set(Object.keys(artifact.migrations).map(file=>file.split('/').slice(3,5).join('/')))].map(module=>({module,result:{policy:module.startsWith('master/')?'none':'reference',inserted:module.startsWith('master/')?0:1}}));
 const database={async query(sql:string){calls.push({sql});if(sql.includes('current_database'))return{rows:[{name:patch.database??'app_core_app'}]};if(sql.includes('pg_tables'))return{rows:patch.tables??[]};return{rows:[{count:patch.businessCount??'0'}]};}};
 const runImage=async(spec:any)=>{calls.push(spec);if(spec.argv.at(-1)==='plan'){plans++;return patch.plan??{applied:plans===1?[]:names,pending:plans===1?names:[]};}if(spec.argv.at(-1)==='migrate'){if(patch.migrationError)throw Error('migration interrupted');return 'Application migrations complete.';}return patch.seeds??seeds;};
 return {calls,database,runImage};
}
test('approved Core fresh hook runs exact image migrations and explicit production reference seed only',async()=>{
 const h=harness();const result=await prepareFreshCoreDatabase(options(),h);assert.equal(result.migrationCount,40);assert.equal(result.organisationReady,false);
 const images=h.calls.filter(c=>c.argv);assert.equal(images.length,4);assert.ok(images.every(c=>c.imageId===coreUbuntuRelease.imageId&&c.environment.NODE_ENV==='production'&&c.databaseCredential==='CORE_APP_MIGRATION_DATABASE_URL'));
 assert.deepEqual(images[3].argv,['node','scripts/database.ts','seed','--tenant','ubuntu:tenant-new']);assert.ok(!JSON.stringify(h.calls).match(/pg_dump|pg_restore|--demo|fresh|reset|\.env/));assert.equal(h.calls.filter(c=>c.sql?.startsWith('SELECT count')).length,6);
});
test('wrong target/platform/root/lock/public policy/release or missing explicit tenant fail before database access',async()=>{
 for(const patch of [{platform:'win32'},{hostname:'other'},{appRoot:'D:/workspace/codebiz'},{mode:'update'},{prior:{}},{dataTenantKey:''},{dataTenantKey:'a b'},{target:{...target,lock:'/tmp/other'}},{target:{...target,publicExposure:true}},{target:{...target,binding:'0.0.0.0'}},{manifest:{...artifact,image:'latest'}},{manifest:{...artifact,version:'0.1.8'}},{manifest:{...artifact,migrations:{}}}]){const h=harness();await assert.rejects(prepareFreshCoreDatabase({...options(),...patch},h));assert.deepEqual(h.calls,[]);}
});
test('unknown database or retained public tables stop before any image/migration command',async()=>{
 for(const patch of [{database:'native_core'},{tables:[{tablename:'companies'}]}]){const h=harness(patch);await assert.rejects(prepareFreshCoreDatabase(options(),h));assert.equal(h.calls.filter(c=>c.argv).length,0);}
});
test('unexpected or partial migration plans never seed and migration failures never reset/rollback',async()=>{
 for(const patch of [{plan:{applied:['old'],pending:[]}},{migrationError:true}]){const h=harness(patch);await assert.rejects(prepareFreshCoreDatabase(options(),h));assert.ok(!h.calls.some(c=>c.argv?.includes('seed')));assert.ok(!JSON.stringify(h.calls).match(/rollback|reset|DROP/));}
});
test('demo/bootstrap seed results and manufactured business records fail closed without cleanup',async()=>{
 for(const patch of [{seeds:Array.from({length:37},()=>({module:'common/unit',result:{policy:'demo'}}))},{seeds:Array.from({length:37},()=>({module:'master/company',result:{policy:'reference',inserted:1}}))},{businessCount:'1'}]){const h=harness(patch);await assert.rejects(prepareFreshCoreDatabase(options(),h));assert.ok(!JSON.stringify(h.calls).match(/DELETE|DROP|TRUNCATE/));}
});
