import type { Kysely } from "kysely";
import type { Database } from "../../../database/schema.ts";
import {
  requireModulePermission,
  type ModuleContext,
} from "../../../database/context.ts";
import { ConflictError } from "../../../http.ts";
import { findInternalAddressType, listAddressType } from "./repository.ts";
export async function listAddressTypeRecords(
  db: Kysely<Database>,
  context: ModuleContext,
) {
  requireModulePermission(context, "common/address-type:read");
  return listAddressType(db, context);
}
// Public in-app reference boundary. The owning module verifies scope, permission and active state.
export async function resolveAddressTypeReference(
  db: Kysely<Database>,
  context: ModuleContext,
  publicId: string,
) {
  requireModulePermission(context, "common/address-type:read");
  const record = await findInternalAddressType(db, context, publicId);
  if (!record || !record.active)
    throw new ConflictError(
      "Selected address type was not found or is inactive.",
    );
  return record;
}
