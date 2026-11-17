import { z } from "zod";
import type { Kysely } from "kysely";
import type { Database } from "../../../database/schema.ts";
import {
  requireModulePermission,
  type ModuleContext,
} from "../../../database/context.ts";
import { unitValuesSchema } from "../../../../../contracts/unit.ts";
import { listUnit, findUnit, insertUnit, updateUnit } from "./repository.ts";

const idSchema = z.string().regex(/^[a-z0-9]{8}$/);
export function createUnitService(db: Kysely<Database>) {
  return {
    list(context: ModuleContext) {
      requireModulePermission(context, "common/unit:read");
      return listUnit(db, context);
    },
    find(context: ModuleContext, publicId: string) {
      requireModulePermission(context, "common/unit:read");
      return findUnit(db, context, idSchema.parse(publicId));
    },
    create(context: ModuleContext, input: unknown) {
      requireModulePermission(context, "common/unit:write");
      return insertUnit(db, context, unitValuesSchema.parse(input));
    },
    update(context: ModuleContext, publicId: string, input: unknown) {
      requireModulePermission(context, "common/unit:write");
      return updateUnit(
        db,
        context,
        idSchema.parse(publicId),
        unitValuesSchema.parse(input),
      );
    },
  };
}
