import { z } from "zod";
import type { Kysely } from "kysely";
import type { Database } from "../../../database/schema.ts";
import {
  requireModulePermission,
  type ModuleContext,
} from "../../../database/context.ts";
import { salesTypeValuesSchema } from "../../../../../contracts/sales-type.ts";
import {
  listSalesType,
  findSalesType,
  insertSalesType,
  updateSalesType,
} from "./repository.ts";

const idSchema = z.string().regex(/^[a-z0-9]{8}$/);
export function createSalesTypeService(db: Kysely<Database>) {
  return {
    list(context: ModuleContext) {
      requireModulePermission(context, "common/sales-type:read");
      return listSalesType(db, context);
    },
    find(context: ModuleContext, publicId: string) {
      requireModulePermission(context, "common/sales-type:read");
      return findSalesType(db, context, idSchema.parse(publicId));
    },
    create(context: ModuleContext, input: unknown) {
      requireModulePermission(context, "common/sales-type:write");
      return insertSalesType(db, context, salesTypeValuesSchema.parse(input));
    },
    update(context: ModuleContext, publicId: string, input: unknown) {
      requireModulePermission(context, "common/sales-type:write");
      return updateSalesType(
        db,
        context,
        idSchema.parse(publicId),
        salesTypeValuesSchema.parse(input),
      );
    },
  };
}
