import { z } from "zod";
import type { Kysely } from "kysely";
import type { Database } from "../../../database/schema.ts";
import {
  requireModulePermission,
  type ModuleContext,
} from "../../../database/context.ts";
import { workOrderValuesSchema } from "../../../../../contracts/work-order.ts";
import {
  listWorkOrder,
  findWorkOrder,
  insertWorkOrder,
  updateWorkOrder,
} from "./repository.ts";

const idSchema = z.string().regex(/^[a-z0-9]{8}$/);
export function createWorkOrderService(db: Kysely<Database>) {
  return {
    list(context: ModuleContext) {
      requireModulePermission(context, "master/work-order:read");
      return listWorkOrder(db, context);
    },
    find(context: ModuleContext, publicId: string) {
      requireModulePermission(context, "master/work-order:read");
      return findWorkOrder(db, context, idSchema.parse(publicId));
    },
    create(context: ModuleContext, input: unknown) {
      requireModulePermission(context, "master/work-order:write");
      return insertWorkOrder(db, context, workOrderValuesSchema.parse(input));
    },
    update(context: ModuleContext, publicId: string, input: unknown) {
      requireModulePermission(context, "master/work-order:write");
      return updateWorkOrder(
        db,
        context,
        idSchema.parse(publicId),
        workOrderValuesSchema.parse(input),
      );
    },
  };
}
