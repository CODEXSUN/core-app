import{modulePageQuerySchema}from'../../../../../contracts/module-page.ts';
import{resolveDistrictReference}from'../district/index.ts';
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
    async page(context: ModuleContext,input:unknown){requireModulePermission(context,'common/city:read');const value=modulePageQuerySchema.parse(input),refs=z.object({districtId:idSchema.optional()}).strict().parse(value.references);if(refs.districtId)await resolveDistrictReference(db,context,refs.districtId);return pageCityRecords(db,context,value);},
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
