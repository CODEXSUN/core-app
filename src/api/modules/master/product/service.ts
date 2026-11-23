import {softDeleteCoreRecord} from '../../../database/soft-delete.ts';
import {pageProductRecords} from './repository.ts';
import { z } from "zod";
import type { Kysely } from "kysely";
import type { Database } from "../../../database/schema.ts";
import {
  requireModulePermission,
  type ModuleContext,
} from "../../../database/context.ts";
import { productValuesSchema } from "../../../../../contracts/product.ts";
import {
  listProduct,
  findProduct,
  insertProduct,
  updateProduct,
} from "./repository.ts";

const idSchema = z.string().regex(/^[a-z0-9]{8}$/);
export function createProductService(db: Kysely<Database>) {
  return {
    remove(context: ModuleContext, publicId: string) {
      requireModulePermission(context, "master/product:delete");
      return softDeleteCoreRecord(db, context, "products", idSchema.parse(publicId));
    },
    page(context: ModuleContext,input:unknown){requireModulePermission(context,'master/product:read');return pageProductRecords(db,context,input);},
    list(context: ModuleContext) {
      requireModulePermission(context, "master/product:read");
      return listProduct(db, context);
    },
    find(context: ModuleContext, publicId: string) {
      requireModulePermission(context, "master/product:read");
      return findProduct(db, context, idSchema.parse(publicId));
    },
    create(context: ModuleContext, input: unknown) {
      requireModulePermission(context, "master/product:write");
      return insertProduct(db, context, productValuesSchema.parse(input));
    },
    update(context: ModuleContext, publicId: string, input: unknown) {
      requireModulePermission(context, "master/product:write");
      return updateProduct(
        db,
        context,
        idSchema.parse(publicId),
        productValuesSchema.parse(input),
      );
    },
  };
}
