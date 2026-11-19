import test from 'node:test';
import assert from 'node:assert/strict';
import {transientDatabaseStartupFailure} from '../src/api/database/startup.ts';
test('Core retries known transient startup transport/recovery failures but fails closed on schema/auth/config errors',()=>{
 for(const code of ['57P03','53300','08006','ECONNREFUSED','ECONNRESET','ETIMEDOUT'])assert.equal(transientDatabaseStartupFailure({code}),true,code);
 for(const code of ['42P01','42703','42501','28P01','3D000','23505'])assert.equal(transientDatabaseStartupFailure({code}),false,code);
 for(const error of [undefined,null,'configuration',new Error('unexpected')])assert.equal(transientDatabaseStartupFailure(error),false);
});
