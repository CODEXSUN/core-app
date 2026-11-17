import { z } from "zod";
import type { Kysely } from "kysely";
import type { Database } from "../../../database/schema.ts";
import {
  requireModulePermission,
  type ModuleContext,
} from "../../../database/context.ts";
import { monthValuesSchema } from "../../../../../contracts/month.ts";
import {
  listMonth,
  findMonth,
  insertMonth,
  updateMonth,
} from "./repository.ts";

const idSchema = z.string().regex(/^[a-z0-9]{8}$/);
export function createMonthService(db: Kysely<Database>) {
  return {
    list(context: ModuleContext) {
      requireModulePermission(context, "common/month:read");
      return listMonth(db, context);
    },
    find(context: ModuleContext, publicId: string) {
      requireModulePermission(context, "common/month:read");
      return findMonth(db, context, idSchema.parse(publicId));
    },
    create(context: ModuleContext, input: unknown) {
      requireModulePermission(context, "common/month:write");
      return insertMonth(db, context, monthValuesSchema.parse(input));
    },
    update(context: ModuleContext, publicId: string, input: unknown) {
      requireModulePermission(context, "common/month:write");
      return updateMonth(
        db,
        context,
        idSchema.parse(publicId),
        monthValuesSchema.parse(input),
      );
    },
  };
}
