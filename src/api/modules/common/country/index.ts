import type { Kysely } from "kysely";
import type { Database } from "../../../database/schema.ts";
import {
  requireModulePermission,
  type ModuleContext,
} from "../../../database/context.ts";
import { ConflictError } from "../../../http.ts";
import { findInternalCountry, listCountry } from "./repository.ts";
export async function listCountryRecords(
  db: Kysely<Database>,
  context: ModuleContext,
) {
  requireModulePermission(context, "common/country:read");
  return listCountry(db, context);
}
// Public in-app reference boundary. The owning module verifies scope, permission and active state.
export async function resolveCountryReference(
  db: Kysely<Database>,
  context: ModuleContext,
  publicId: string,
) {
  requireModulePermission(context, "common/country:read");
  const record = await findInternalCountry(db, context, publicId);
  if (!record || !record.active)
    throw new ConflictError("Selected country was not found or is inactive.");
  return record;
}
