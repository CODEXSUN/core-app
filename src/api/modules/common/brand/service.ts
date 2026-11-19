import {pageBrandRecords} from './repository.ts';
import { z } from "zod";
import type { Kysely } from "kysely";
import type { Database } from "../../../database/schema.ts";
import {
  requireModulePermission,
  type ModuleContext,
} from "../../../database/context.ts";
import { brandValuesSchema } from "../../../../../contracts/brand.ts";
import {
  listBrand,
  findBrand,
  insertBrand,
  updateBrand,
} from "./repository.ts";

const idSchema = z.string().regex(/^[a-z0-9]{8}$/);
export function createBrandService(db: Kysely<Database>) {
  return {
    page(context: ModuleContext,input:unknown){requireModulePermission(context,'common/brand:read');return pageBrandRecords(db,context,input);},
    list(context: ModuleContext) {
      requireModulePermission(context, "common/brand:read");
      return listBrand(db, context);
    },
    find(context: ModuleContext, publicId: string) {
      requireModulePermission(context, "common/brand:read");
      return findBrand(db, context, idSchema.parse(publicId));
    },
    create(context: ModuleContext, input: unknown) {
      requireModulePermission(context, "common/brand:write");
      return insertBrand(db, context, brandValuesSchema.parse(input));
    },
    update(context: ModuleContext, publicId: string, input: unknown) {
      requireModulePermission(context, "common/brand:write");
      return updateBrand(
        db,
        context,
        idSchema.parse(publicId),
        brandValuesSchema.parse(input),
      );
    },
  };
}
