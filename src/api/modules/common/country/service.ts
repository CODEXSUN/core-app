import {softDeleteCoreRecord} from '../../../database/soft-delete.ts';
import {pageCountryRecords} from './repository.ts';
import { z } from "zod";
import type { Kysely } from "kysely";
import type { Database } from "../../../database/schema.ts";
import {
  requireModulePermission,
  type ModuleContext,
} from "../../../database/context.ts";
import { countryValuesSchema } from "../../../../../contracts/country.ts";
import {
  listCountry,
  findCountry,
  insertCountry,
  updateCountry,
} from "./repository.ts";

const idSchema = z.string().regex(/^[a-z0-9]{8}$/);
export function createCountryService(db: Kysely<Database>) {
  return {
    remove(context: ModuleContext, publicId: string) {
      requireModulePermission(context, "common/country:delete");
      return softDeleteCoreRecord(db, context, "countries", idSchema.parse(publicId));
    },
    page(context: ModuleContext,input:unknown){requireModulePermission(context,'common/country:read');return pageCountryRecords(db,context,input);},
    list(context: ModuleContext) {
      requireModulePermission(context, "common/country:read");
      return listCountry(db, context);
    },
    find(context: ModuleContext, publicId: string) {
      requireModulePermission(context, "common/country:read");
      return findCountry(db, context, idSchema.parse(publicId));
    },
    create(context: ModuleContext, input: unknown) {
      requireModulePermission(context, "common/country:write");
      return insertCountry(db, context, countryValuesSchema.parse(input));
    },
    update(context: ModuleContext, publicId: string, input: unknown) {
      requireModulePermission(context, "common/country:write");
      return updateCountry(
        db,
        context,
        idSchema.parse(publicId),
        countryValuesSchema.parse(input),
      );
    },
  };
}
