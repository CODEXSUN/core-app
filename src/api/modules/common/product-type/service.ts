import {softDeleteCoreRecord} from '../../../database/soft-delete.ts';
import {pageProductTypeRecords} from './repository.ts';
import { z } from "zod";
import type { Kysely } from "kysely";
import type { Database } from "../../../database/schema.ts";
import {
  requireModulePermission,
  type ModuleContext,
} from "../../../database/context.ts";
import { productTypeValuesSchema } from "../../../../../contracts/product-type.ts";
import {
  listProductType,
  findProductType,
  insertProductType,
  updateProductType,
} from "./repository.ts";

const idSchema = z.string().regex(/^[a-z0-9]{8}$/);
export function createProductTypeService(db: Kysely<Database>) {
  return {
    remove(context: ModuleContext, publicId: string) {
      requireModulePermission(context, "common/product-type:delete");
      return softDeleteCoreRecord(db, context, "product_types", idSchema.parse(publicId));
    },
    page(context: ModuleContext,input:unknown){requireModulePermission(context,'common/product-type:read');return pageProductTypeRecords(db,context,input);},
    list(context: ModuleContext) {
      requireModulePermission(context, "common/product-type:read");
      return listProductType(db, context);
    },
    find(context: ModuleContext, publicId: string) {
      requireModulePermission(context, "common/product-type:read");
      return findProductType(db, context, idSchema.parse(publicId));
    },
    create(context: ModuleContext, input: unknown) {
      requireModulePermission(context, "common/product-type:write");
      return insertProductType(
        db,
        context,
        productTypeValuesSchema.parse(input),
      );
    },
    update(context: ModuleContext, publicId: string, input: unknown) {
      requireModulePermission(context, "common/product-type:write");
      return updateProductType(
        db,
        context,
        idSchema.parse(publicId),
        productTypeValuesSchema.parse(input),
      );
    },
  };
}
