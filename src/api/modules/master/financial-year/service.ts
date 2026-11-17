import { z } from "zod";
import type { Kysely } from "kysely";
import type { Database } from "../../../database/schema.ts";
import {
  requireModulePermission,
  type ModuleContext,
} from "../../../database/context.ts";
import { financialYearValuesSchema } from "../../../../../contracts/financial-year.ts";
import {
  listFinancialYear,
  findFinancialYear,
  insertFinancialYear,
  updateFinancialYear,
} from "./repository.ts";

const idSchema = z.string().regex(/^[a-z0-9]{8}$/);
export function createFinancialYearService(db: Kysely<Database>) {
  return {
    list(context: ModuleContext) {
      requireModulePermission(context, "master/financial-year:read");
      return listFinancialYear(db, context);
    },
    find(context: ModuleContext, publicId: string) {
      requireModulePermission(context, "master/financial-year:read");
      return findFinancialYear(db, context, idSchema.parse(publicId));
    },
    create(context: ModuleContext, input: unknown) {
      requireModulePermission(context, "master/financial-year:write");
      return insertFinancialYear(
        db,
        context,
        financialYearValuesSchema.parse(input),
      );
    },
    update(context: ModuleContext, publicId: string, input: unknown) {
      requireModulePermission(context, "master/financial-year:write");
      return updateFinancialYear(
        db,
        context,
        idSchema.parse(publicId),
        financialYearValuesSchema.parse(input),
      );
    },
  };
}
