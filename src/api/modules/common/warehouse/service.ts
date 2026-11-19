import {pageWarehouseRecords} from './repository.ts';
import { z } from "zod";
import type { Kysely } from "kysely";
import type { Database } from "../../../database/schema.ts";
import {
  requireModulePermission,
  type ModuleContext,
} from "../../../database/context.ts";
import { warehouseValuesSchema } from "../../../../../contracts/warehouse.ts";
import {
  listWarehouse,
  findWarehouse,
  insertWarehouse,
  updateWarehouse,
} from "./repository.ts";

const idSchema = z.string().regex(/^[a-z0-9]{8}$/);
export function createWarehouseService(db: Kysely<Database>) {
  return {
    page(context: ModuleContext,input:unknown){requireModulePermission(context,'common/warehouse:read');return pageWarehouseRecords(db,context,input);},
    list(context: ModuleContext) {
      requireModulePermission(context, "common/warehouse:read");
      return listWarehouse(db, context);
    },
    find(context: ModuleContext, publicId: string) {
      requireModulePermission(context, "common/warehouse:read");
      return findWarehouse(db, context, idSchema.parse(publicId));
    },
    create(context: ModuleContext, input: unknown) {
      requireModulePermission(context, "common/warehouse:write");
      return insertWarehouse(db, context, warehouseValuesSchema.parse(input));
    },
    update(context: ModuleContext, publicId: string, input: unknown) {
      requireModulePermission(context, "common/warehouse:write");
      return updateWarehouse(
        db,
        context,
        idSchema.parse(publicId),
        warehouseValuesSchema.parse(input),
      );
    },
  };
}
