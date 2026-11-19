import test from'node:test';
import assert from'node:assert/strict';
import{modulePageQuerySchema}from'../contracts/module-page.ts';
import{coreCases}from'./core-module-cases.ts';
import{ModuleAccessError}from'../src/api/database/context.ts';
test('module pages reject invalid bounds, oversized/invalid filter JSON and untrusted query fields',()=>{
 assert.deepEqual(modulePageQuerySchema.parse({page:'2',pageSize:'100',filters:'{"name":"Test"}'}),{q:'',page:2,pageSize:100,direction:'asc',filters:{name:'Test'},references:{}});
 for(const query of[{page:0},{pageSize:101},{page:'1e2'},{page:'-1'},{q:'x'.repeat(81)},{filters:'['},{filters:'x'.repeat(4097)},{filters:'{"__proto__":"x"}'},{direction:'drop table'},{tenantId:'foreign'}])assert.throws(()=>modulePageQuerySchema.parse(query));
 for(const query of[{references:'{"countryId":"../foreign"}'},{references:'{"__proto__":"aaaaaaaa"}'},{references:'['},{references:'x'.repeat(513)}])assert.throws(()=>modulePageQuerySchema.parse(query));
});
test('all37 module page services retain their owner read permission before database access',async()=>{
 const db=new Proxy({},{get(){throw Error('Denied service must not query storage');}});
 for(const owner of coreCases){const module=await import('../src/api/modules/'+owner.key+'/service.ts');const factory=Object.entries(module).find(([name])=>/^create.*Service$/.test(name))?.[1] as Function;assert.ok(factory,owner.name);const service=factory(db);await assert.rejects(Promise.resolve().then(()=>service.page({actorId:'fixture',tenantId:'tenant-a',permissions:[]},{})),ModuleAccessError,owner.name);}
});
test('exact parent constraints retain the original parent-owner read permission before SQL',async()=>{
 const db=new Proxy({},{get(){throw Error('Missing parent rights must not query storage');}});
 for(const[name,type,field]of[['state','State','countryId'],['district','District','stateId'],['city','City','districtId'],['pincode','Pincode','cityId']]){const module=await import('../src/api/modules/common/'+name+'/service.ts');const service=module['create'+type+'Service'](db);await assert.rejects(service.page({actorId:'fixture',tenantId:'tenant-a',permissions:['common/'+name+':read']},{references:{[field]:'aaaaaaaa'}}),ModuleAccessError);}
});
