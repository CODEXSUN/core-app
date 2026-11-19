import type { Kysely } from "kysely";
import type { Database } from "../../../database/schema.ts";
import {
  requireModulePermission,
  type ModuleContext,
} from "../../../database/context.ts";
import { ConflictError } from "../../../http.ts";
import { findInternalContact, listContact } from "./repository.ts";
import {searchBillingContacts,findBillingContact} from './repository.ts';
import {billingContactQuerySchema,billingLookupIdSchema} from '../../../../../contracts/billing-catalog.ts';
export function lookupBillingContacts(db:Kysely<Database>,context:ModuleContext,input:unknown){requireModulePermission(context,'master/contact:read');return searchBillingContacts(db,context,billingContactQuerySchema.parse(input));}
export function lookupBillingContact(db:Kysely<Database>,context:ModuleContext,id:string){requireModulePermission(context,'master/contact:read');return findBillingContact(db,context,billingLookupIdSchema.parse(id));}
export async function listContactRecords(
  db: Kysely<Database>,
  context: ModuleContext,
) {
  requireModulePermission(context, "master/contact:read");
  return listContact(db, context);
}
// Public in-app reference boundary. The owning module verifies scope, permission and active state.
export async function resolveContactReference(
  db: Kysely<Database>,
  context: ModuleContext,
  publicId: string,
) {
  requireModulePermission(context, "master/contact:read");
  const record = await findInternalContact(db, context, publicId);
  if (!record || !record.active)
    throw new ConflictError("Selected contact was not found or is inactive.");
  return record;
}
