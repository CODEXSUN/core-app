import type { Kysely } from "kysely";
import type { Database } from "../../../database/schema.ts";
import {
  requireModulePermission,
  type ModuleContext,
} from "../../../database/context.ts";
import { ConflictError } from "../../../http.ts";
import { findInternalUnit, listUnit } from "./repository.ts";
import {activeUnitExists} from './repository.ts';
export function hasActiveUnit(db:Kysely<Database>,context:ModuleContext){requireModulePermission(context,'common/unit:read');return activeUnitExists(db,context);}
export async function listUnitRecords(
  db: Kysely<Database>,
  context: ModuleContext,
) {
  requireModulePermission(context, "common/unit:read");
  return listUnit(db, context);
}
// Public in-app reference boundary. The owning module verifies scope, permission and active state.
export async function resolveUnitReference(
  db: Kysely<Database>,
  context: ModuleContext,
  publicId: string,
) {
  requireModulePermission(context, "common/unit:read");
  const record = await findInternalUnit(db, context, publicId);
  if (!record || !record.active)
    throw new ConflictError("Selected unit was not found or is inactive.");
  return record;
}
