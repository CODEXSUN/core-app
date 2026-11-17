import type { Kysely } from "kysely";
import type { Database } from "../../../database/schema.ts";
import {
  requireModulePermission,
  type ModuleContext,
} from "../../../database/context.ts";
import { ConflictError } from "../../../http.ts";
import { findInternalMonth, listMonth } from "./repository.ts";
export async function listMonthRecords(
  db: Kysely<Database>,
  context: ModuleContext,
) {
  requireModulePermission(context, "common/month:read");
  return listMonth(db, context);
}
// Public in-app reference boundary. The owning module verifies scope, permission and active state.
export async function resolveMonthReference(
  db: Kysely<Database>,
  context: ModuleContext,
  publicId: string,
) {
  requireModulePermission(context, "common/month:read");
  const record = await findInternalMonth(db, context, publicId);
  if (!record || !record.active)
    throw new ConflictError("Selected month was not found or is inactive.");
  return record;
}
