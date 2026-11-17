import { z } from "zod";
import type { Kysely } from "kysely";
import type { Database } from "../../../database/schema.ts";
import {
  requireModulePermission,
  type ModuleContext,
} from "../../../database/context.ts";
import { bankNameValuesSchema } from "../../../../../contracts/bank-name.ts";
import {
  listBankName,
  findBankName,
  insertBankName,
  updateBankName,
} from "./repository.ts";

const idSchema = z.string().regex(/^[a-z0-9]{8}$/);
export function createBankNameService(db: Kysely<Database>) {
  return {
    list(context: ModuleContext) {
      requireModulePermission(context, "common/bank-name:read");
      return listBankName(db, context);
    },
    find(context: ModuleContext, publicId: string) {
      requireModulePermission(context, "common/bank-name:read");
      return findBankName(db, context, idSchema.parse(publicId));
    },
    create(context: ModuleContext, input: unknown) {
      requireModulePermission(context, "common/bank-name:write");
      return insertBankName(db, context, bankNameValuesSchema.parse(input));
    },
    update(context: ModuleContext, publicId: string, input: unknown) {
      requireModulePermission(context, "common/bank-name:write");
      return updateBankName(
        db,
        context,
        idSchema.parse(publicId),
        bankNameValuesSchema.parse(input),
      );
    },
  };
}
