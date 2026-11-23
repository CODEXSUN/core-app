import {softDeleteCoreRecord} from '../../../database/soft-delete.ts';
import {pageDestinationRecords} from './repository.ts';
import { z } from "zod";
import type { Kysely } from "kysely";
import type { Database } from "../../../database/schema.ts";
import {
  requireModulePermission,
  type ModuleContext,
} from "../../../database/context.ts";
import { destinationValuesSchema } from "../../../../../contracts/destination.ts";
import {
  listDestination,
  findDestination,
  insertDestination,
  updateDestination,
} from "./repository.ts";

const idSchema = z.string().regex(/^[a-z0-9]{8}$/);
export function createDestinationService(db: Kysely<Database>) {
  return {
    remove(context: ModuleContext, publicId: string) {
      requireModulePermission(context, "common/destination:delete");
      return softDeleteCoreRecord(db, context, "destinations", idSchema.parse(publicId));
    },
    page(context: ModuleContext,input:unknown){requireModulePermission(context,'common/destination:read');return pageDestinationRecords(db,context,input);},
    list(context: ModuleContext) {
      requireModulePermission(context, "common/destination:read");
      return listDestination(db, context);
    },
    find(context: ModuleContext, publicId: string) {
      requireModulePermission(context, "common/destination:read");
      return findDestination(db, context, idSchema.parse(publicId));
    },
    create(context: ModuleContext, input: unknown) {
      requireModulePermission(context, "common/destination:write");
      return insertDestination(
        db,
        context,
        destinationValuesSchema.parse(input),
      );
    },
    update(context: ModuleContext, publicId: string, input: unknown) {
      requireModulePermission(context, "common/destination:write");
      return updateDestination(
        db,
        context,
        idSchema.parse(publicId),
        destinationValuesSchema.parse(input),
      );
    },
  };
}
