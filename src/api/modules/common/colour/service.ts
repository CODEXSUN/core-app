import {pageColourRecords} from './repository.ts';
import { z } from "zod";
import type { Kysely } from "kysely";
import type { Database } from "../../../database/schema.ts";
import {
  requireModulePermission,
  type ModuleContext,
} from "../../../database/context.ts";
import { colourValuesSchema } from "../../../../../contracts/colour.ts";
import {
  listColour,
  findColour,
  insertColour,
  updateColour,
} from "./repository.ts";

const idSchema = z.string().regex(/^[a-z0-9]{8}$/);
export function createColourService(db: Kysely<Database>) {
  return {
    page(context: ModuleContext,input:unknown){requireModulePermission(context,'common/colour:read');return pageColourRecords(db,context,input);},
    list(context: ModuleContext) {
      requireModulePermission(context, "common/colour:read");
      return listColour(db, context);
    },
    find(context: ModuleContext, publicId: string) {
      requireModulePermission(context, "common/colour:read");
      return findColour(db, context, idSchema.parse(publicId));
    },
    create(context: ModuleContext, input: unknown) {
      requireModulePermission(context, "common/colour:write");
      return insertColour(db, context, colourValuesSchema.parse(input));
    },
    update(context: ModuleContext, publicId: string, input: unknown) {
      requireModulePermission(context, "common/colour:write");
      return updateColour(
        db,
        context,
        idSchema.parse(publicId),
        colourValuesSchema.parse(input),
      );
    },
  };
}
