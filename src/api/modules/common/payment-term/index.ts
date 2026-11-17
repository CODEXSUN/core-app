import type { Kysely } from "kysely";
import type { Database } from "../../../database/schema.ts";
import {
  requireModulePermission,
  type ModuleContext,
} from "../../../database/context.ts";
import { ConflictError } from "../../../http.ts";
import { findInternalPaymentTerm, listPaymentTerm } from "./repository.ts";
export async function listPaymentTermRecords(
  db: Kysely<Database>,
  context: ModuleContext,
) {
  requireModulePermission(context, "common/payment-term:read");
  return listPaymentTerm(db, context);
}
// Public in-app reference boundary. The owning module verifies scope, permission and active state.
export async function resolvePaymentTermReference(
  db: Kysely<Database>,
  context: ModuleContext,
  publicId: string,
) {
  requireModulePermission(context, "common/payment-term:read");
  const record = await findInternalPaymentTerm(db, context, publicId);
  if (!record || !record.active)
    throw new ConflictError(
      "Selected payment term was not found or is inactive.",
    );
  return record;
}
