import {pageCityRecords} from './repository.ts';
import { z } from "zod";
import type { Kysely } from "kysely";
import type { Database } from "../../../database/schema.ts";
import {
  requireModulePermission,
  type ModuleContext,
} from "../../../database/context.ts";
import { cityValuesSchema } from "../../../../../contracts/city.ts";
import { listCity, findCity, insertCity, updateCity } from "./repository.ts";

const idSchema = z.string().regex(/^[a-z0-9]{8}$/);
export function createCityService(db: Kysely<Database>) {
  return {
    page(context: ModuleContext,input:unknown){requireModulePermission(context,'common/city:read');return pageCityRecords(db,context,input);},
    list(context: ModuleContext) {
      requireModulePermission(context, "common/city:read");
      return listCity(db, context);
    },
    find(context: ModuleContext, publicId: string) {
      requireModulePermission(context, "common/city:read");
      return findCity(db, context, idSchema.parse(publicId));
    },
    create(context: ModuleContext, input: unknown) {
      requireModulePermission(context, "common/city:write");
      return insertCity(db, context, cityValuesSchema.parse(input));
    },
    update(context: ModuleContext, publicId: string, input: unknown) {
      requireModulePermission(context, "common/city:write");
      return updateCity(
        db,
        context,
        idSchema.parse(publicId),
        cityValuesSchema.parse(input),
      );
    },
  };
}
