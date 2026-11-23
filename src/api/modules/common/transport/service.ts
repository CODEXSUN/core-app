import {softDeleteCoreRecord} from '../../../database/soft-delete.ts';
import {pageTransportRecords} from './repository.ts';
import { z } from "zod";
import type { Kysely } from "kysely";
import type { Database } from "../../../database/schema.ts";
import {
  requireModulePermission,
  type ModuleContext,
} from "../../../database/context.ts";
import { transportValuesSchema } from "../../../../../contracts/transport.ts";
import {
  listTransport,
  findTransport,
  insertTransport,
  updateTransport,
} from "./repository.ts";

const idSchema = z.string().regex(/^[a-z0-9]{8}$/);
export function createTransportService(db: Kysely<Database>) {
  return {
    remove(context: ModuleContext, publicId: string) {
      requireModulePermission(context, "common/transport:delete");
      return softDeleteCoreRecord(db, context, "transports", idSchema.parse(publicId));
    },
    page(context: ModuleContext,input:unknown){requireModulePermission(context,'common/transport:read');return pageTransportRecords(db,context,input);},
    list(context: ModuleContext) {
      requireModulePermission(context, "common/transport:read");
      return listTransport(db, context);
    },
    find(context: ModuleContext, publicId: string) {
      requireModulePermission(context, "common/transport:read");
      return findTransport(db, context, idSchema.parse(publicId));
    },
    create(context: ModuleContext, input: unknown) {
      requireModulePermission(context, "common/transport:write");
      return insertTransport(db, context, transportValuesSchema.parse(input));
    },
    update(context: ModuleContext, publicId: string, input: unknown) {
      requireModulePermission(context, "common/transport:write");
      return updateTransport(
        db,
        context,
        idSchema.parse(publicId),
        transportValuesSchema.parse(input),
      );
    },
  };
}
