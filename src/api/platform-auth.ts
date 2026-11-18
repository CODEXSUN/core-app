import type {FastifyInstance,FastifyRequest} from 'fastify';
import {registerPlatformApplication} from '@workspace/sdk/platform-application';
import type {ContextResolver} from './database/context.ts';
export function platformAuthentication(values:NodeJS.ProcessEnv){
 let gate:ReturnType<typeof registerPlatformApplication>;
 const dataTenant=values.CORE_APP_DATA_TENANT_KEY;
 if(!dataTenant||dataTenant.length>128)throw Error('Configure the existing Core data tenant binding.');
 const resolveContext:ContextResolver=async request=>{const current=gate.context(request);return {actorId:current.tenantId+':'+current.userId,tenantId:dataTenant,permissions:current.permissions};};
 return {resolveContext,register(app:FastifyInstance){
  gate=registerPlatformApplication(app,values,'CORE_APP','core-app',{requireTenantBinding:true});
  app.get('/api/v1/session',async(request:FastifyRequest)=>({context:await resolveContext(request),localAccess:false}));
 }};
}
