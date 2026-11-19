import {pageProductCategoryRecords} from './repository.ts';
import { z } from "zod";
import type { Kysely } from "kysely";
import type { Database } from "../../../database/schema.ts";
import {
  requireModulePermission,
  type ModuleContext,
} from "../../../database/context.ts";
import { productCategoryValuesSchema } from "../../../../../contracts/product-category.ts";
import {
  listProductCategory,
  findProductCategory,
  insertProductCategory,
  updateProductCategory,
} from "./repository.ts";

const idSchema = z.string().regex(/^[a-z0-9]{8}$/);
export function createProductCategoryService(db: Kysely<Database>) {
  return {
    page(context: ModuleContext,input:unknown){requireModulePermission(context,'common/product-category:read');return pageProductCategoryRecords(db,context,input);},
    list(context: ModuleContext) {
      requireModulePermission(context, "common/product-category:read");
      return listProductCategory(db, context);
    },
    find(context: ModuleContext, publicId: string) {
      requireModulePermission(context, "common/product-category:read");
      return findProductCategory(db, context, idSchema.parse(publicId));
    },
    create(context: ModuleContext, input: unknown) {
      requireModulePermission(context, "common/product-category:write");
      return insertProductCategory(
        db,
        context,
        productCategoryValuesSchema.parse(input),
      );
    },
    update(context: ModuleContext, publicId: string, input: unknown) {
      requireModulePermission(context, "common/product-category:write");
      return updateProductCategory(
        db,
        context,
        idSchema.parse(publicId),
        productCategoryValuesSchema.parse(input),
      );
    },
  };
}
