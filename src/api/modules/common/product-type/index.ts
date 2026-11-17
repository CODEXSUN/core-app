import type { Kysely } from "kysely";
import type { Database } from "../../../database/schema.ts";
import {
  requireModulePermission,
  type ModuleContext,
} from "../../../database/context.ts";
import { ConflictError } from "../../../http.ts";
import { findInternalProductType, listProductType } from "./repository.ts";
export async function listProductTypeRecords(
  db: Kysely<Database>,
  context: ModuleContext,
) {
  requireModulePermission(context, "common/product-type:read");
  return listProductType(db, context);
}
// Public in-app reference boundary. The owning module verifies scope, permission and active state.
export async function resolveProductTypeReference(
  db: Kysely<Database>,
  context: ModuleContext,
  publicId: string,
) {
  requireModulePermission(context, "common/product-type:read");
  const record = await findInternalProductType(db, context, publicId);
  if (!record || !record.active)
    throw new ConflictError(
      "Selected product type was not found or is inactive.",
    );
  return record;
}
