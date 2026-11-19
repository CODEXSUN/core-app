import type { Kysely } from "kysely";
import type { Database } from "../../../database/schema.ts";
import {
  requireModulePermission,
  type ModuleContext,
} from "../../../database/context.ts";
import { ConflictError } from "../../../http.ts";
import { findInternalCurrency, listCurrency } from "./repository.ts";
import {selectBillingCurrencies} from './repository.ts';
import {activeCurrencyExists} from './repository.ts';
import {billingBootstrapSelectionSchema} from '../../../../../contracts/billing-catalog.ts';
export function lookupBillingCurrencies(db:Kysely<Database>,context:ModuleContext,codes:unknown){requireModulePermission(context,'common/currency:read');return selectBillingCurrencies(db,context,billingBootstrapSelectionSchema.shape.currencyCodes.parse(codes));}
export function hasActiveCurrency(db:Kysely<Database>,context:ModuleContext){requireModulePermission(context,'common/currency:read');return activeCurrencyExists(db,context);}
export async function listCurrencyRecords(
  db: Kysely<Database>,
  context: ModuleContext,
) {
  requireModulePermission(context, "common/currency:read");
  return listCurrency(db, context);
}
// Public in-app reference boundary. The owning module verifies scope, permission and active state.
export async function resolveCurrencyReference(
  db: Kysely<Database>,
  context: ModuleContext,
  publicId: string,
) {
  requireModulePermission(context, "common/currency:read");
  const record = await findInternalCurrency(db, context, publicId);
  if (!record || !record.active)
    throw new ConflictError("Selected currency was not found or is inactive.");
  return record;
}
