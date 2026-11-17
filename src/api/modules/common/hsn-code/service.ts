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
