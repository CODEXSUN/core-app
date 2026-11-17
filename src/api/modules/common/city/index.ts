import type { Kysely } from "kysely";
import type { Database } from "../../../database/schema.ts";
import {
  requireModulePermission,
  type ModuleContext,
} from "../../../database/context.ts";
import { ConflictError } from "../../../http.ts";
import { findInternalCity, listCity } from "./repository.ts";
export async function listCityRecords(
  db: Kysely<Database>,
  context: ModuleContext,
) {
  requireModulePermission(context, "common/city:read");
  return listCity(db, context);
}
// Public in-app reference boundary. The owning module verifies scope, permission and active state.
export async function resolveCityReference(
  db: Kysely<Database>,
  context: ModuleContext,
  publicId: string,
) {
  requireModulePermission(context, "common/city:read");
  const record = await findInternalCity(db, context, publicId);
  if (!record || !record.active)
    throw new ConflictError("Selected city was not found or is inactive.");
  return record;
}
