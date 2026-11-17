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
