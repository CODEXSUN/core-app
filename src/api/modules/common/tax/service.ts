import {pageTaxRecords} from './repository.ts';
import { z } from "zod";
import type { Kysely } from "kysely";
import type { Database } from "../../../database/schema.ts";
import {
  requireModulePermission,
  type ModuleContext,
} from "../../../database/context.ts";
import { taxValuesSchema } from "../../../../../contracts/tax.ts";
import { listTax, findTax, insertTax, updateTax } from "./repository.ts";

const idSchema = z.string().regex(/^[a-z0-9]{8}$/);
export function createTaxService(db: Kysely<Database>) {
  return {
    page(context: ModuleContext,input:unknown){requireModulePermission(context,'common/tax:read');return pageTaxRecords(db,context,input);},
    list(context: ModuleContext) {
      requireModulePermission(context, "common/tax:read");
      return listTax(db, context);
    },
    find(context: ModuleContext, publicId: string) {
      requireModulePermission(context, "common/tax:read");
      return findTax(db, context, idSchema.parse(publicId));
    },
    create(context: ModuleContext, input: unknown) {
      requireModulePermission(context, "common/tax:write");
      return insertTax(db, context, taxValuesSchema.parse(input));
    },
    update(context: ModuleContext, publicId: string, input: unknown) {
      requireModulePermission(context, "common/tax:write");
      return updateTax(
        db,
        context,
        idSchema.parse(publicId),
        taxValuesSchema.parse(input),
      );
    },
  };
}
