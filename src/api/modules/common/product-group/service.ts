import { z } from "zod";
import type { Kysely } from "kysely";
import type { Database } from "../../../database/schema.ts";
import {
  requireModulePermission,
  type ModuleContext,
} from "../../../database/context.ts";
import { productGroupValuesSchema } from "../../../../../contracts/product-group.ts";
import {
  listProductGroup,
  findProductGroup,
  insertProductGroup,
  updateProductGroup,
} from "./repository.ts";

const idSchema = z.string().regex(/^[a-z0-9]{8}$/);
export function createProductGroupService(db: Kysely<Database>) {
  return {
    list(context: ModuleContext) {
      requireModulePermission(context, "common/product-group:read");
      return listProductGroup(db, context);
    },
    find(context: ModuleContext, publicId: string) {
      requireModulePermission(context, "common/product-group:read");
      return findProductGroup(db, context, idSchema.parse(publicId));
    },
    create(context: ModuleContext, input: unknown) {
      requireModulePermission(context, "common/product-group:write");
      return insertProductGroup(
        db,
        context,
        productGroupValuesSchema.parse(input),
      );
    },
    update(context: ModuleContext, publicId: string, input: unknown) {
      requireModulePermission(context, "common/product-group:write");
      return updateProductGroup(
        db,
        context,
        idSchema.parse(publicId),
        productGroupValuesSchema.parse(input),
      );
    },
  };
}
