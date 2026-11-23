import pg from 'pg';
import {randomBytes} from 'node:crypto';
export const coreRuntimeTables=Object.freeze(['countries','states','districts','cities','pincodes','ledger_groups','ledgers','address_types','bank_names','contact_groups','contact_types','currencies','months','payment_terms','priorities','sales_types','brands','colours','hsn_codes','product_categories','product_groups','product_types','sizes','styles','taxes','units','destinations','stock_rejection_types','transports','warehouses','work_order_types','companies','financial_years','contacts','products','work_orders','default_companies']);
const roles=new Set(['app_core_app','app_core_app_runtime']);
function runtimeScope(env){
 let source;try{source=new URL(env.CORE_APP_DATABASE_URL??'');}catch{throw Error('Configure the approved restricted Core runtime database credential.');}
 if(!['postgres:','postgresql:'].includes(source.protocol)||!roles.has(source.username)||!source.password||!['127.0.0.1','localhost','postgres'].includes(source.hostname)||source.pathname!=='/app_core_app'||!['5432','5433'].includes(source.port||'5432'))throw Error('Configure the approved restricted Core runtime database credential.');
 return source;
}
const quoted=value=>'"'+value.replaceAll('"','""')+'"';
const literal=value=>"'"+value.replaceAll("'","''")+"'";
/** Host-owned fresh-only provisioning callback. Caller validates Ubuntu target,
 * holds the canonical lock and persists encrypted recovery before any DDL.
 * No native .env discovery/import, setup records, grant fabrication or retry. */
export async function prepareCoreFreshDatabase(adminConfig,env,persist,dependencies={}){
 const source=runtimeScope(env),runtimeRole=source.username;
 let migration;try{migration=env.CORE_APP_MIGRATION_DATABASE_URL?new URL(env.CORE_APP_MIGRATION_DATABASE_URL):undefined;}catch{throw Error('Invalid retained Core migrator credential.');}
 if(migration&&(!['postgres:','postgresql:'].includes(migration.protocol)||migration.hostname!=='postgres'||migration.port!=='5432'||migration.pathname!=='/app_core_app'||migration.username!=='app_core_app_migrator'||!migration.password||migration.search))throw Error('Invalid retained Core migrator credential.');
 const Client=dependencies.Client??pg.Client,random=dependencies.randomBytes??randomBytes;
 const admin=new Client(adminConfig);await admin.connect();
 try{
  const existing=await admin.query("SELECT 1 FROM pg_database WHERE datname='app_core_app' UNION ALL SELECT 1 FROM pg_roles WHERE rolname IN ('app_core_app','app_core_app_runtime','app_core_app_migrator')");
  if(existing.rowCount)throw Error('Core database or roles already exist without a fresh marker; retain them for recovery review.');
  const runtime=decodeURIComponent(source.password),password=migration?decodeURIComponent(migration.password):random(32).toString('hex');
  if(!runtime||!password||runtime.includes('\0')||password.includes('\0')||runtime===password)throw Error('Core runtime and migrator credentials must be distinct.');
  source.hostname='postgres';source.port='5432';source.pathname='/app_core_app';source.search='';source.hash='';
  const migrationTarget=new URL(source);migrationTarget.username='app_core_app_migrator';migrationTarget.password=password;
  env.CORE_APP_DATABASE_URL=source.href;env.CORE_APP_MIGRATION_DATABASE_URL=migrationTarget.href;
  env.CORE_APP_PLATFORM_AUTH='1';env.CORE_APP_LOCAL_ACCESS='false';env.CORE_APP_API_CLIENTS='[]';
  await persist();
  await admin.query('SET standard_conforming_strings = on');
  await admin.query('CREATE ROLE app_core_app_migrator LOGIN PASSWORD '+literal(password)+' NOSUPERUSER NOCREATEDB NOCREATEROLE NOBYPASSRLS');
  await admin.query('CREATE ROLE '+quoted(runtimeRole)+' LOGIN PASSWORD '+literal(runtime)+' NOSUPERUSER NOCREATEDB NOCREATEROLE NOBYPASSRLS');
  await admin.query('CREATE DATABASE app_core_app OWNER app_core_app_migrator');
  await admin.query('REVOKE ALL ON DATABASE app_core_app FROM PUBLIC');
  await admin.query('GRANT CONNECT ON DATABASE app_core_app TO '+quoted(runtimeRole));
  const db=new Client({...adminConfig,database:'app_core_app'});await db.connect();
  try{await db.query('REVOKE ALL ON SCHEMA public FROM PUBLIC; GRANT USAGE,CREATE ON SCHEMA public TO app_core_app_migrator; GRANT USAGE ON SCHEMA public TO '+quoted(runtimeRole));}finally{await db.end();}
 }finally{await admin.end();}
}
/** After approved-image migrations and reference seeds, grant only Core DML;
 * runtime never owns schema/history or receives migrator membership/DDL. */
export async function grantCoreRuntime(adminConfig,env,dependencies={}){
 const scope=runtimeScope(env);if(scope.hostname!=='postgres'||scope.port!=='5432'||scope.search)throw Error('Invalid Core runtime grant scope.');
 const Client=dependencies.Client??pg.Client,db=new Client({...adminConfig,database:'app_core_app'});await db.connect();
 try{
  const role=quoted(scope.username);
  await db.query('GRANT SELECT,INSERT,UPDATE,DELETE ON '+coreRuntimeTables.map(quoted).join(',')+' TO '+role);
  await db.query('GRANT USAGE,SELECT ON ALL SEQUENCES IN SCHEMA public TO '+role);
  await db.query('GRANT SELECT ON kysely_migration TO '+role);
 }finally{await db.end();}
}
