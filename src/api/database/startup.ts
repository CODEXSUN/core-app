import {sql,type Kysely} from 'kysely';
import {waitForReadiness} from '@workspace/framework';
import type {Database} from './schema.ts';

export function transientDatabaseStartupFailure(error:unknown){
 const code=error&&typeof error==='object'&&'code'in error?error.code:undefined;
 return typeof code==='string'&&['57P03','53300','08000','08001','08003','08006','ECONNREFUSED','ECONNRESET','ETIMEDOUT','EHOSTUNREACH','ENETUNREACH'].includes(code);
}
/** Connection readiness only. Schema compatibility is a separate fatal startup check. */
export function waitForCoreDatabase(db:Kysely<Database>){
 return waitForReadiness(async()=>{await sql`SELECT 1`.execute(db);return true;},{retryOnError:transientDatabaseStartupFailure});
}
