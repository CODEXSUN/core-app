import{modulePageQuerySchema}from'../../../../../contracts/module-page.ts';
import{resolveCountryReference}from'../country/index.ts';
import {pageStateRecords} from './repository.ts';
import { z } from "zod";
import type { Kysely } from "kysely";
import type { Database } from "../../../database/schema.ts";
import {
  requireModulePermission,
  type ModuleContext,
} from "../../../database/context.ts";
import { stateValuesSchema } from "../../../../../contracts/state.ts";
import {
  listState,
  findState,
  insertState,
  updateState,
} from "./repository.ts";

const idSchema = z.string().regex(/^[a-z0-9]{8}$/);
export function createStateService(db: Kysely<Database>) {
  return {
    async page(context: ModuleContext,input:unknown){requireModulePermission(context,'common/state:read');const value=modulePageQuerySchema.parse(input),refs=z.object({countryId:idSchema.optional()}).strict().parse(value.references);if(refs.countryId)await resolveCountryReference(db,context,refs.countryId);return pageStateRecords(db,context,value);},
    list(context: ModuleContext) {
      requireModulePermission(context, "common/state:read");
      return listState(db, context);
    },
    find(context: ModuleContext, publicId: string) {
      requireModulePermission(context, "common/state:read");
      return findState(db, context, idSchema.parse(publicId));
    },
    create(context: ModuleContext, input: unknown) {
      requireModulePermission(context, "common/state:write");
      return insertState(db, context, stateValuesSchema.parse(input));
    },
    update(context: ModuleContext, publicId: string, input: unknown) {
      requireModulePermission(context, "common/state:write");
      return updateState(
        db,
        context,
        idSchema.parse(publicId),
        stateValuesSchema.parse(input),
      );
    },
  };
}
