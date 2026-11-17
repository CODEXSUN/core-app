import type { Kysely } from "kysely";
import type { Database } from "../../../database/schema.ts";
import {
  requireModulePermission,
  type ModuleContext,
} from "../../../database/context.ts";
import { ConflictError } from "../../../http.ts";
import { findInternalTransport, listTransport } from "./repository.ts";
export async function listTransportRecords(
  db: Kysely<Database>,
  context: ModuleContext,
) {
  requireModulePermission(context, "common/transport:read");
  return listTransport(db, context);
}
// Public in-app reference boundary. The owning module verifies scope, permission and active state.
export async function resolveTransportReference(
  db: Kysely<Database>,
  context: ModuleContext,
  publicId: string,
) {
  requireModulePermission(context, "common/transport:read");
  const record = await findInternalTransport(db, context, publicId);
  if (!record || !record.active)
    throw new ConflictError("Selected transport was not found or is inactive.");
  return record;
}
