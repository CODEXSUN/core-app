import {softDeleteCoreRecord} from '../../../database/soft-delete.ts';
import {pageStockRejectionTypeRecords} from './repository.ts';
import { z } from "zod";
import type { Kysely } from "kysely";
import type { Database } from "../../../database/schema.ts";
import {
  requireModulePermission,
  type ModuleContext,
} from "../../../database/context.ts";
import { stockRejectionTypeValuesSchema } from "../../../../../contracts/stock-rejection-type.ts";
import {
  listStockRejectionType,
  findStockRejectionType,
  insertStockRejectionType,
  updateStockRejectionType,
} from "./repository.ts";

const idSchema = z.string().regex(/^[a-z0-9]{8}$/);
export function createStockRejectionTypeService(db: Kysely<Database>) {
  return {
    remove(context: ModuleContext, publicId: string) {
      requireModulePermission(context, "common/stock-rejection-type:delete");
      return softDeleteCoreRecord(db, context, "stock_rejection_types", idSchema.parse(publicId));
    },
    page(context: ModuleContext,input:unknown){requireModulePermission(context,'common/stock-rejection-type:read');return pageStockRejectionTypeRecords(db,context,input);},
    list(context: ModuleContext) {
      requireModulePermission(context, "common/stock-rejection-type:read");
      return listStockRejectionType(db, context);
    },
    find(context: ModuleContext, publicId: string) {
      requireModulePermission(context, "common/stock-rejection-type:read");
      return findStockRejectionType(db, context, idSchema.parse(publicId));
    },
    create(context: ModuleContext, input: unknown) {
      requireModulePermission(context, "common/stock-rejection-type:write");
      return insertStockRejectionType(
        db,
        context,
        stockRejectionTypeValuesSchema.parse(input),
      );
    },
    update(context: ModuleContext, publicId: string, input: unknown) {
      requireModulePermission(context, "common/stock-rejection-type:write");
      return updateStockRejectionType(
        db,
        context,
        idSchema.parse(publicId),
        stockRejectionTypeValuesSchema.parse(input),
      );
    },
  };
}
