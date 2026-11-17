import type { Kysely } from "kysely";
import type { Database } from "../../../database/schema.ts";
import {
  requireModulePermission,
  type ModuleContext,
} from "../../../database/context.ts";
import { ConflictError } from "../../../http.ts";
import { findInternalDestination, listDestination } from "./repository.ts";
export async function listDestinationRecords(
  db: Kysely<Database>,
  context: ModuleContext,
) {
  requireModulePermission(context, "common/destination:read");
  return listDestination(db, context);
}
// Public in-app reference boundary. The owning module verifies scope, permission and active state.
export async function resolveDestinationReference(
  db: Kysely<Database>,
  context: ModuleContext,
  publicId: string,
) {
  requireModulePermission(context, "common/destination:read");
  const record = await findInternalDestination(db, context, publicId);
  if (!record || !record.active)
    throw new ConflictError(
      "Selected destination was not found or is inactive.",
    );
  return record;
}
