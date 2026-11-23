import {softDeleteCoreRecord} from '../../../database/soft-delete.ts';
import {pageWorkOrderTypeRecords} from './repository.ts';
import { z } from "zod";
import type { Kysely } from "kysely";
import type { Database } from "../../../database/schema.ts";
import {
  requireModulePermission,
  type ModuleContext,
} from "../../../database/context.ts";
import { workOrderTypeValuesSchema } from "../../../../../contracts/work-order-type.ts";
import {
  listWorkOrderType,
  findWorkOrderType,
  insertWorkOrderType,
  updateWorkOrderType,
} from "./repository.ts";

const idSchema = z.string().regex(/^[a-z0-9]{8}$/);
export function createWorkOrderTypeService(db: Kysely<Database>) {
  return {
    remove(context: ModuleContext, publicId: string) {
      requireModulePermission(context, "common/work-order-type:delete");
      return softDeleteCoreRecord(db, context, "work_order_types", idSchema.parse(publicId));
    },
    page(context: ModuleContext,input:unknown){requireModulePermission(context,'common/work-order-type:read');return pageWorkOrderTypeRecords(db,context,input);},
    list(context: ModuleContext) {
      requireModulePermission(context, "common/work-order-type:read");
      return listWorkOrderType(db, context);
    },
    find(context: ModuleContext, publicId: string) {
      requireModulePermission(context, "common/work-order-type:read");
      return findWorkOrderType(db, context, idSchema.parse(publicId));
    },
    create(context: ModuleContext, input: unknown) {
      requireModulePermission(context, "common/work-order-type:write");
      return insertWorkOrderType(
        db,
        context,
        workOrderTypeValuesSchema.parse(input),
      );
    },
    update(context: ModuleContext, publicId: string, input: unknown) {
      requireModulePermission(context, "common/work-order-type:write");
      return updateWorkOrderType(
        db,
        context,
        idSchema.parse(publicId),
        workOrderTypeValuesSchema.parse(input),
      );
    },
  };
}
