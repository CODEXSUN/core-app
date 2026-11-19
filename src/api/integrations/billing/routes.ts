import type {FastifyInstance} from 'fastify';
import type {Kysely} from 'kysely';
import type {Database} from '../../database/schema.ts';
import type {ContextResolver} from '../../database/context.ts';
import {performModule} from '../../http.ts';
import {getBillingContext} from './context.ts';
export function registerBillingContextRoutes(app:FastifyInstance,db:Kysely<Database>,resolve:ContextResolver){
 app.get('/api/v1/billing-context',(request,reply)=>performModule(request,reply,resolve,context=>getBillingContext(db,context,request.query)));
}
export const billingContextOpenApiPaths={
 '/api/v1/billing-context':{get:{operationId:'getBillingCoreContext',tags:['Billing integration'],description:'Read-only aggregate. Requires all organisation, contact, product and currency read permissions. Selection IDs are resolved inside the authenticated tenant; Billing must additionally enforce its actor company/year policy. No client tenant override.',security:[{bearerAuth:[]},{cookieAuth:[]}],parameters:['companyId','financialYearId'].map(name=>({name,in:'query',required:false,schema:{type:'string',pattern:'^[a-z0-9]{8}$'}})),responses:{200:{description:'Organisation, selected company/year and tenant-scoped contacts/products/currencies'},400:{description:'Invalid selection'},401:{description:'Authentication required'},403:{description:'Permission denied'},404:{description:'Default not configured'},409:{description:'Selected record missing, foreign or inactive'}}}},
};
