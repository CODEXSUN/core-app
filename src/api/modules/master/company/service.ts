import {pageCompanyRecords} from './repository.ts';
import { z } from "zod";
import type { Kysely } from "kysely";
import type { Database } from "../../../database/schema.ts";
import {
  requireModulePermission,
  type ModuleContext,
} from "../../../database/context.ts";
import { companyValuesSchema } from "../../../../../contracts/company.ts";
import {
  listCompany,
  findCompany,
  insertCompany,
  updateCompany,
} from "./repository.ts";

const idSchema = z.string().regex(/^[a-z0-9]{8}$/);
export function createCompanyService(db: Kysely<Database>) {
  return {
    page(context: ModuleContext,input:unknown){requireModulePermission(context,'master/company:read');return pageCompanyRecords(db,context,input);},
    list(context: ModuleContext) {
      requireModulePermission(context, "master/company:read");
      return listCompany(db, context);
    },
    find(context: ModuleContext, publicId: string) {
      requireModulePermission(context, "master/company:read");
      return findCompany(db, context, idSchema.parse(publicId));
    },
    create(context: ModuleContext, input: unknown) {
      requireModulePermission(context, "master/company:write");
      return insertCompany(db, context, companyValuesSchema.parse(input));
    },
    update(context: ModuleContext, publicId: string, input: unknown) {
      requireModulePermission(context, "master/company:write");
      return updateCompany(
        db,
        context,
        idSchema.parse(publicId),
        companyValuesSchema.parse(input),
      );
    },
  };
}
