import {softDeleteCoreRecord} from '../../../database/soft-delete.ts';
import {pageSizeRecords} from './repository.ts';
import { z } from "zod";
import type { Kysely } from "kysely";
import type { Database } from "../../../database/schema.ts";
import {
  requireModulePermission,
  type ModuleContext,
} from "../../../database/context.ts";
import { sizeValuesSchema } from "../../../../../contracts/size.ts";
import { listSize, findSize, insertSize, updateSize } from "./repository.ts";

const idSchema = z.string().regex(/^[a-z0-9]{8}$/);
export function createSizeService(db: Kysely<Database>) {
  return {
    remove(context: ModuleContext, publicId: string) {
      requireModulePermission(context, "common/size:delete");
      return softDeleteCoreRecord(db, context, "sizes", idSchema.parse(publicId));
    },
    page(context: ModuleContext,input:unknown){requireModulePermission(context,'common/size:read');return pageSizeRecords(db,context,input);},
    list(context: ModuleContext) {
      requireModulePermission(context, "common/size:read");
      return listSize(db, context);
    },
    find(context: ModuleContext, publicId: string) {
      requireModulePermission(context, "common/size:read");
      return findSize(db, context, idSchema.parse(publicId));
    },
    create(context: ModuleContext, input: unknown) {
      requireModulePermission(context, "common/size:write");
      return insertSize(db, context, sizeValuesSchema.parse(input));
    },
    update(context: ModuleContext, publicId: string, input: unknown) {
      requireModulePermission(context, "common/size:write");
      return updateSize(
        db,
        context,
        idSchema.parse(publicId),
        sizeValuesSchema.parse(input),
      );
    },
  };
}
