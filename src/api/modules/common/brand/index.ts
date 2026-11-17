import type { Kysely } from "kysely";
import type { Database } from "../../../database/schema.ts";
import {
  requireModulePermission,
  type ModuleContext,
} from "../../../database/context.ts";
import { ConflictError } from "../../../http.ts";
import { findInternalBrand, listBrand } from "./repository.ts";
export async function listBrandRecords(
  db: Kysely<Database>,
  context: ModuleContext,
) {
  requireModulePermission(context, "common/brand:read");
  return listBrand(db, context);
}
// Public in-app reference boundary. The owning module verifies scope, permission and active state.
export async function resolveBrandReference(
  db: Kysely<Database>,
  context: ModuleContext,
  publicId: string,
) {
  requireModulePermission(context, "common/brand:read");
  const record = await findInternalBrand(db, context, publicId);
  if (!record || !record.active)
    throw new ConflictError("Selected brand was not found or is inactive.");
  return record;
}
