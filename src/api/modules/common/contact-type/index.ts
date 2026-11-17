import type { Kysely } from "kysely";
import type { Database } from "../../../database/schema.ts";
import {
  requireModulePermission,
  type ModuleContext,
} from "../../../database/context.ts";
import { ConflictError } from "../../../http.ts";
import { findInternalContactType, listContactType } from "./repository.ts";
export async function listContactTypeRecords(
  db: Kysely<Database>,
  context: ModuleContext,
) {
  requireModulePermission(context, "common/contact-type:read");
  return listContactType(db, context);
}
// Public in-app reference boundary. The owning module verifies scope, permission and active state.
export async function resolveContactTypeReference(
  db: Kysely<Database>,
  context: ModuleContext,
  publicId: string,
) {
  requireModulePermission(context, "common/contact-type:read");
  const record = await findInternalContactType(db, context, publicId);
  if (!record || !record.active)
    throw new ConflictError(
      "Selected contact type was not found or is inactive.",
    );
  return record;
}
