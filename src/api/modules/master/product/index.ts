import type { Kysely } from "kysely";
import type { Database } from "../../../database/schema.ts";
import {
  requireModulePermission,
  type ModuleContext,
} from "../../../database/context.ts";
import { ConflictError } from "../../../http.ts";
import { findInternalProduct, listProduct } from "./repository.ts";
import {searchBillingProducts,findBillingProduct} from './repository.ts';
import {billingLookupQuerySchema,billingLookupIdSchema} from '../../../../../contracts/billing-catalog.ts';
export function lookupBillingProducts(db:Kysely<Database>,context:ModuleContext,input:unknown){requireModulePermission(context,'master/product:read');return searchBillingProducts(db,context,billingLookupQuerySchema.parse(input));}
export function lookupBillingProduct(db:Kysely<Database>,context:ModuleContext,id:string){requireModulePermission(context,'master/product:read');return findBillingProduct(db,context,billingLookupIdSchema.parse(id));}
export async function listProductRecords(
  db: Kysely<Database>,
  context: ModuleContext,
) {
  requireModulePermission(context, "master/product:read");
  return listProduct(db, context);
}
// Public in-app reference boundary. The owning module verifies scope, permission and active state.
export async function resolveProductReference(
  db: Kysely<Database>,
  context: ModuleContext,
  publicId: string,
) {
  requireModulePermission(context, "master/product:read");
  const record = await findInternalProduct(db, context, publicId);
  if (!record || !record.active)
    throw new ConflictError("Selected product was not found or is inactive.");
  return record;
}
