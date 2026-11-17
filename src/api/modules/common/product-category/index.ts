import type { Kysely } from "kysely";
import type { Database } from "../../../database/schema.ts";
import {
  requireModulePermission,
  type ModuleContext,
} from "../../../database/context.ts";
import { ConflictError } from "../../../http.ts";
import {
  findInternalProductCategory,
  listProductCategory,
} from "./repository.ts";
export async function listProductCategoryRecords(
  db: Kysely<Database>,
  context: ModuleContext,
) {
  requireModulePermission(context, "common/product-category:read");
  return listProductCategory(db, context);
}
// Public in-app reference boundary. The owning module verifies scope, permission and active state.
export async function resolveProductCategoryReference(
  db: Kysely<Database>,
  context: ModuleContext,
  publicId: string,
) {
  requireModulePermission(context, "common/product-category:read");
  const record = await findInternalProductCategory(db, context, publicId);
  if (!record || !record.active)
    throw new ConflictError(
      "Selected product category was not found or is inactive.",
    );
  return record;
}
