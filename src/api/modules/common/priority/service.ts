import {softDeleteCoreRecord} from '../../../database/soft-delete.ts';
import {pagePriorityRecords} from './repository.ts';
import { z } from "zod";
import type { Kysely } from "kysely";
import type { Database } from "../../../database/schema.ts";
import {
  requireModulePermission,
  type ModuleContext,
} from "../../../database/context.ts";
import { priorityValuesSchema } from "../../../../../contracts/priority.ts";
import {
  listPriority,
  findPriority,
  insertPriority,
  updatePriority,
} from "./repository.ts";

const idSchema = z.string().regex(/^[a-z0-9]{8}$/);
export function createPriorityService(db: Kysely<Database>) {
  return {
    remove(context: ModuleContext, publicId: string) {
      requireModulePermission(context, "common/priority:delete");
      return softDeleteCoreRecord(db, context, "priorities", idSchema.parse(publicId));
    },
    page(context: ModuleContext,input:unknown){requireModulePermission(context,'common/priority:read');return pagePriorityRecords(db,context,input);},
    list(context: ModuleContext) {
      requireModulePermission(context, "common/priority:read");
      return listPriority(db, context);
    },
    find(context: ModuleContext, publicId: string) {
      requireModulePermission(context, "common/priority:read");
      return findPriority(db, context, idSchema.parse(publicId));
    },
    create(context: ModuleContext, input: unknown) {
      requireModulePermission(context, "common/priority:write");
      return insertPriority(db, context, priorityValuesSchema.parse(input));
    },
    update(context: ModuleContext, publicId: string, input: unknown) {
      requireModulePermission(context, "common/priority:write");
      return updatePriority(
        db,
        context,
        idSchema.parse(publicId),
        priorityValuesSchema.parse(input),
      );
    },
  };
}
