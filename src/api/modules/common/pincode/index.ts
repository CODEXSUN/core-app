import type { Kysely } from "kysely";
import type { Database } from "../../../database/schema.ts";
import {
  requireModulePermission,
  type ModuleContext,
} from "../../../database/context.ts";
import { ConflictError } from "../../../http.ts";
import { findInternalPincode, listPincode } from "./repository.ts";
export async function listPincodeRecords(
  db: Kysely<Database>,
  context: ModuleContext,
) {
  requireModulePermission(context, "common/pincode:read");
  return listPincode(db, context);
}
// Public in-app reference boundary. The owning module verifies scope, permission and active state.
export async function resolvePincodeReference(
  db: Kysely<Database>,
  context: ModuleContext,
  publicId: string,
) {
  requireModulePermission(context, "common/pincode:read");
  const record = await findInternalPincode(db, context, publicId);
  if (!record || !record.active)
    throw new ConflictError("Selected pincode was not found or is inactive.");
  return record;
}
