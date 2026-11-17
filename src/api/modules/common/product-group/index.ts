import type { Kysely } from "kysely";
import type { Database } from "../../../database/schema.ts";
import {
  requireModulePermission,
  type ModuleContext,
} from "../../../database/context.ts";
import { ConflictError } from "../../../http.ts";
import { findInternalProductGroup, listProductGroup } from "./repository.ts";
export async function listProductGroupRecords(
  db: Kysely<Database>,
  context: ModuleContext,
) {
  requireModulePermission(context, "common/product-group:read");
  return listProductGroup(db, context);
}
// Public in-app reference boundary. The owning module verifies scope, permission and active state.
export async function resolveProductGroupReference(
  db: Kysely<Database>,
  context: ModuleContext,
  publicId: string,
) {
  requireModulePermission(context, "common/product-group:read");
  const record = await findInternalProductGroup(db, context, publicId);
  if (!record || !record.active)
    throw new ConflictError(
      "Selected product group was not found or is inactive.",
    );
  return record;
}
