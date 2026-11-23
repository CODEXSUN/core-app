import {softDeleteCoreRecord} from '../../../database/soft-delete.ts';
import {pageHsnCodeRecords} from './repository.ts';
import { z } from "zod";
import type { Kysely } from "kysely";
import type { Database } from "../../../database/schema.ts";
import {
  requireModulePermission,
  type ModuleContext,
} from "../../../database/context.ts";
import { hsnCodeValuesSchema } from "../../../../../contracts/hsn-code.ts";
import {
  listHsnCode,
  findHsnCode,
  insertHsnCode,
  updateHsnCode,
} from "./repository.ts";

const idSchema = z.string().regex(/^[a-z0-9]{8}$/);
export function createHsnCodeService(db: Kysely<Database>) {
  return {
    remove(context: ModuleContext, publicId: string) {
      requireModulePermission(context, "common/hsn-code:delete");
      return softDeleteCoreRecord(db, context, "hsn_codes", idSchema.parse(publicId));
    },
    page(context: ModuleContext,input:unknown){requireModulePermission(context,'common/hsn-code:read');return pageHsnCodeRecords(db,context,input);},
    list(context: ModuleContext) {
      requireModulePermission(context, "common/hsn-code:read");
      return listHsnCode(db, context);
    },
    find(context: ModuleContext, publicId: string) {
      requireModulePermission(context, "common/hsn-code:read");
      return findHsnCode(db, context, idSchema.parse(publicId));
    },
    create(context: ModuleContext, input: unknown) {
      requireModulePermission(context, "common/hsn-code:write");
      return insertHsnCode(db, context, hsnCodeValuesSchema.parse(input));
    },
    update(context: ModuleContext, publicId: string, input: unknown) {
      requireModulePermission(context, "common/hsn-code:write");
      return updateHsnCode(
        db,
        context,
        idSchema.parse(publicId),
        hsnCodeValuesSchema.parse(input),
      );
    },
  };
}
