// Host-side Core hook only. The shared Ubuntu owner holds the canonical lock,
// provisions the empty app database, and supplies an immutable-image runner.
// This module never discovers native environments or invokes a Docker/SSH CLI.
export const coreUbuntuRelease=Object.freeze({version:'0.1.7',commit:'a4b429fd2f15770c8074f4669363318e3b93e198',imageId:'sha256:fab45e03bed878f5b785d75ecc3d75e4920fd19a5c7a398148ff846d5b132782'});
const operator='/srv/codebiz/operators/v-1.0.21/devkit/codeship';
export function validateCoreFreshTarget({target,manifest,platform,hostname,appRoot,mode,prior,dataTenantKey}){
 if(platform!=='linux'||hostname!=='cxserver'||appRoot!==operator||target?.id!=='ubuntu-lan'||target.host!=='192.168.1.34'||target.root!=='/srv/codebiz'||target.state!=='/srv/codebiz/state'||target.hostname!==hostname||target.operator!==operator||target.lock!=='/srv/codebiz/state/devkits/operation.lock'||target.binding!=='127.0.0.1'||target.publicExposure!==false||target.dataPolicy!=='fresh')throw Error('Core fresh Ubuntu target mismatch.');
 if(mode!=='setup'||prior)throw Error('Core fresh hook cannot update or adopt existing data.');
 if(manifest?.repository!=='CODEXSUN/core-app'||manifest.owner!=='apps/core-app'||manifest.version!==coreUbuntuRelease.version||manifest.commit!==coreUbuntuRelease.commit||manifest.tag!=='v-0.1.7'||manifest.imageId!==coreUbuntuRelease.imageId||manifest.image!=='ghcr.io/codexsun/core-app@'+coreUbuntuRelease.imageId)throw Error('Use only the approved immutable Core 0.1.7 image.');
 if(typeof dataTenantKey!=='string'||!/^[a-zA-Z0-9:._-]{1,128}$/.test(dataTenantKey))throw Error('Supply the explicit new Core data tenant binding.');
 const names=Object.keys(manifest.migrations??{}).map(file=>{const m=/^src\/api\/modules\/(?:common|master)\/[a-z-]+\/database\/migrations\/(\d{14}_[a-z0-9_]+)\.ts$/.exec(file);if(!m||!/^[a-f0-9]{64}$/.test(manifest.migrations[file]))throw Error('Invalid Core migration manifest.');return m[1];}).sort();
 if(names.length!==40||new Set(names).size!==40)throw Error('Core 0.1.7 must have exactly 40 distinct migrations.');
 return names;
}
function plan(value){if(typeof value==='string')value=JSON.parse(value);if(!value||!Array.isArray(value.applied)||!Array.isArray(value.pending)||[...value.applied,...value.pending].some(name=>typeof name!=='string'))throw Error('Invalid Core migration plan.');return value;}
const same=(a,b)=>JSON.stringify([...a].sort())===JSON.stringify([...b].sort());
export async function prepareFreshCoreDatabase(options,{database,runImage}){
 const names=validateCoreFreshTarget(options);
 // Query the actual selected database before any image command, not a caller's
 // synthetic "fresh" boolean. Existing/untracked public tables fail closed.
 const identity=await database.query('SELECT current_database() AS name');
 if(identity.rows?.length!==1||identity.rows[0].name!=='app_core_app')throw Error('Unexpected Core database target.');
 const tables=await database.query("SELECT tablename FROM pg_tables WHERE schemaname='public'");
 if(tables.rows?.length!==0)throw Error('Core database is not empty; inspect retained state instead of resetting.');
 const execute=argv=>runImage({image:options.manifest.image,imageId:options.manifest.imageId,cwd:'/opt/codebiz/apps/core-app',databaseCredential:'CORE_APP_MIGRATION_DATABASE_URL',argv,environment:{NODE_ENV:'production',CODESHIP_APP_NAME:'core-app'}});
 const before=plan(await execute(['node','/run/codeship/business-database.mjs','plan']));
 if(before.applied.length||!same(before.pending,names))throw Error('Fresh Core migration plan differs from the approved manifest.');
 await execute(['node','/run/codeship/business-database.mjs','migrate']);
 const after=plan(await execute(['node','/run/codeship/business-database.mjs','plan']));
 if(after.pending.length||!same(after.applied,names))throw Error('Core migrations incomplete; retain database for inspection.');
 // Production module seeders install reference-only data. Company/FY/defaults
 // have policy none; their public IDs must come from explicit later setup.
 const raw=await execute(['node','scripts/database.ts','seed','--tenant',options.dataTenantKey]);
 const seeds=typeof raw==='string'?JSON.parse(raw):raw;
 if(!Array.isArray(seeds)||seeds.length!==37||seeds.some(item=>!item?.module||!['none','reference'].includes(item.result?.policy)))throw Error('Unexpected Core reference seed result; inspect retained database.');
 const expectedModules=[...new Set(Object.keys(options.manifest.migrations).map(file=>file.split('/').slice(3,5).join('/')))];
 if(!same(seeds.map(item=>item.module),expectedModules))throw Error('Core reference seed module plan differs from the approved image.');
 const forbidden=new Set(['master/company','master/financial-year','master/default-company','master/contact','master/product','master/work-order']);
 if(seeds.some(item=>forbidden.has(item.module)&&(item.result.policy!=='none'||Number(item.result.inserted??0)!==0)))throw Error('Core fresh setup must not manufacture business records.');
 for(const table of ['companies','financial_years','default_companies','contacts','products','work_orders']){
  const result=await database.query('SELECT count(*)::text AS count FROM '+table);
  if(result.rows?.length!==1||result.rows[0].count!=='0')throw Error('Core business table is not empty after reference setup.');
 }
 return {database:'app_core_app',migrationCount:40,referenceModules:seeds.length,organisationReady:false,businessSetupRequired:['company','financial-year','default-company']};
}
