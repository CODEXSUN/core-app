import type {FastifyInstance} from 'fastify';
import type {Kysely} from 'kysely';
import type {Database} from '../../database/schema.ts';
import type {ContextResolver} from '../../database/context.ts';
import {performModule} from '../../http.ts';
import {getBillingContext} from './context.ts';
import {getBillingBootstrap,getBillingSetupStatus} from './bootstrap.ts';
import {lookupBillingContacts,lookupBillingContact} from '../../modules/master/contact/index.ts';
import {lookupBillingProducts,lookupBillingProduct} from '../../modules/master/product/index.ts';
import {z} from 'zod';
export function registerBillingContextRoutes(app:FastifyInstance,db:Kysely<Database>,resolve:ContextResolver){
 app.get('/api/v1/billing-context',(request,reply)=>performModule(request,reply,resolve,context=>getBillingContext(db,context,request.query)));
 app.get('/api/v1/billing-bootstrap',(request,reply)=>performModule(request,reply,resolve,context=>getBillingBootstrap(db,context,request.query)));
 app.get('/api/v1/billing-setup-status',(request,reply)=>performModule(request,reply,resolve,context=>{z.object({}).strict().parse(request.query);return getBillingSetupStatus(db,context);}));
 app.get('/api/v1/billing-lookups/contacts',(request,reply)=>performModule(request,reply,resolve,context=>lookupBillingContacts(db,context,request.query)));
 app.get('/api/v1/billing-lookups/products',(request,reply)=>performModule(request,reply,resolve,context=>lookupBillingProducts(db,context,request.query)));
 app.get<{Params:{publicId:string}}>('/api/v1/billing-lookups/contacts/:publicId',(request,reply)=>performModule(request,reply,resolve,context=>{z.object({}).strict().parse(request.query);return lookupBillingContact(db,context,request.params.publicId);}));
 app.get<{Params:{publicId:string}}>('/api/v1/billing-lookups/products/:publicId',(request,reply)=>performModule(request,reply,resolve,context=>{z.object({}).strict().parse(request.query);return lookupBillingProduct(db,context,request.params.publicId);}));
}
export const billingContextOpenApiPaths={
 '/api/v1/billing-context':{get:{operationId:'getBillingCoreContext',tags:['Billing integration'],description:'Read-only aggregate. Requires all organisation, contact, product and currency read permissions. Selection IDs are resolved inside the authenticated tenant; Billing must additionally enforce its actor company/year policy. No client tenant override.',security:[{bearerAuth:[]},{cookieAuth:[]}],parameters:['companyId','financialYearId'].map(name=>({name,in:'query',required:false,schema:{type:'string',pattern:'^[a-z0-9]{8}$'}})),responses:{200:{description:'Organisation, selected company/year and tenant-scoped contacts/products/currencies'},400:{description:'Invalid selection'},401:{description:'Authentication required'},403:{description:'Permission denied'},404:{description:'Default not configured'},409:{description:'Selected record missing, foreign or inactive'}}}},
};
for(const path of ['/api/v1/billing-bootstrap','/api/v1/billing-setup-status','/api/v1/billing-lookups/contacts','/api/v1/billing-lookups/products','/api/v1/billing-lookups/contacts/{publicId}','/api/v1/billing-lookups/products/{publicId}'])Object.assign(billingContextOpenApiPaths,{[path]:{get:{operationId:'get'+path.replace(/[^a-zA-Z0-9]/g,''),tags:['Billing integration'],description:'Authenticated tenant-scoped bounded read. Bootstrap currency codes max10; lookup q max80, pageSize1–100, stable name/public_id ordering. Exact read permissions remain enforced by module owners. Foreign/inactive selected IDs fail closed.',security:[{bearerAuth:[]},{cookieAuth:[]}],responses:{200:{description:'Bounded public DTO'},400:{description:'Invalid query or ID'},401:{description:'Authentication required'},403:{description:'Permission denied'},404:{description:'No matching active tenant record'}}}}});
