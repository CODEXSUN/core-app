import {softDeleteCoreRecord} from '../../../database/soft-delete.ts';
import {pageStyleRecords} from './repository.ts';
import { z } from "zod";
import type { Kysely } from "kysely";
import type { Database } from "../../../database/schema.ts";
import {
  requireModulePermission,
  type ModuleContext,
} from "../../../database/context.ts";
import { styleValuesSchema } from "../../../../../contracts/style.ts";
import {
  listStyle,
  findStyle,
  insertStyle,
  updateStyle,
} from "./repository.ts";

const idSchema = z.string().regex(/^[a-z0-9]{8}$/);
export function createStyleService(db: Kysely<Database>) {
  return {
    remove(context: ModuleContext, publicId: string) {
      requireModulePermission(context, "common/style:delete");
      return softDeleteCoreRecord(db, context, "styles", idSchema.parse(publicId));
    },
    page(context: ModuleContext,input:unknown){requireModulePermission(context,'common/style:read');return pageStyleRecords(db,context,input);},
    list(context: ModuleContext) {
      requireModulePermission(context, "common/style:read");
      return listStyle(db, context);
    },
    find(context: ModuleContext, publicId: string) {
      requireModulePermission(context, "common/style:read");
      return findStyle(db, context, idSchema.parse(publicId));
    },
    create(context: ModuleContext, input: unknown) {
      requireModulePermission(context, "common/style:write");
      return insertStyle(db, context, styleValuesSchema.parse(input));
    },
    update(context: ModuleContext, publicId: string, input: unknown) {
      requireModulePermission(context, "common/style:write");
      return updateStyle(
        db,
        context,
        idSchema.parse(publicId),
        styleValuesSchema.parse(input),
      );
    },
  };
}
