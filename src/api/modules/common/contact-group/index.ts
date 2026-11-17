import type { Kysely } from "kysely";
import type { Database } from "../../../database/schema.ts";
import {
  requireModulePermission,
  type ModuleContext,
} from "../../../database/context.ts";
import { ConflictError } from "../../../http.ts";
import { findInternalContactGroup, listContactGroup } from "./repository.ts";
export async function listContactGroupRecords(
  db: Kysely<Database>,
  context: ModuleContext,
) {
  requireModulePermission(context, "common/contact-group:read");
  return listContactGroup(db, context);
}
// Public in-app reference boundary. The owning module verifies scope, permission and active state.
export async function resolveContactGroupReference(
  db: Kysely<Database>,
  context: ModuleContext,
  publicId: string,
) {
  requireModulePermission(context, "common/contact-group:read");
  const record = await findInternalContactGroup(db, context, publicId);
  if (!record || !record.active)
    throw new ConflictError(
      "Selected contact group was not found or is inactive.",
    );
  return record;
}
