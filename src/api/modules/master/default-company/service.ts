import { z } from "zod";
import type { Kysely } from "kysely";
import type { Database } from "../../../database/schema.ts";
import {
  requireModulePermission,
  type ModuleContext,
} from "../../../database/context.ts";
import { defaultCompanyValuesSchema } from "../../../../../contracts/default-company.ts";
import {
  listDefaultCompany,
  findDefaultCompany,
  insertDefaultCompany,
  updateDefaultCompany,
} from "./repository.ts";

const idSchema = z.string().regex(/^[a-z0-9]{8}$/);
export function createDefaultCompanyService(db: Kysely<Database>) {
  return {
    list(context: ModuleContext) {
      requireModulePermission(context, "master/default-company:read");
      return listDefaultCompany(db, context);
    },
    find(context: ModuleContext, publicId: string) {
      requireModulePermission(context, "master/default-company:read");
      return findDefaultCompany(db, context, idSchema.parse(publicId));
    },
    create(context: ModuleContext, input: unknown) {
      requireModulePermission(context, "master/default-company:write");
      return insertDefaultCompany(
        db,
        context,
        defaultCompanyValuesSchema.parse(input),
      );
    },
    update(context: ModuleContext, publicId: string, input: unknown) {
      requireModulePermission(context, "master/default-company:write");
      return updateDefaultCompany(
        db,
        context,
        idSchema.parse(publicId),
        defaultCompanyValuesSchema.parse(input),
      );
    },
  };
}
