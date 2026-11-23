import {softDeleteCoreRecord} from '../../../database/soft-delete.ts';
import {pageCurrencyRecords} from './repository.ts';
import { z } from "zod";
import type { Kysely } from "kysely";
import type { Database } from "../../../database/schema.ts";
import {
  requireModulePermission,
  type ModuleContext,
} from "../../../database/context.ts";
import { currencyValuesSchema } from "../../../../../contracts/currency.ts";
import {
  listCurrency,
  findCurrency,
  insertCurrency,
  updateCurrency,
} from "./repository.ts";

const idSchema = z.string().regex(/^[a-z0-9]{8}$/);
export function createCurrencyService(db: Kysely<Database>) {
  return {
    remove(context: ModuleContext, publicId: string) {
      requireModulePermission(context, "common/currency:delete");
      return softDeleteCoreRecord(db, context, "currencies", idSchema.parse(publicId));
    },
    page(context: ModuleContext,input:unknown){requireModulePermission(context,'common/currency:read');return pageCurrencyRecords(db,context,input);},
    list(context: ModuleContext) {
      requireModulePermission(context, "common/currency:read");
      return listCurrency(db, context);
    },
    find(context: ModuleContext, publicId: string) {
      requireModulePermission(context, "common/currency:read");
      return findCurrency(db, context, idSchema.parse(publicId));
    },
    create(context: ModuleContext, input: unknown) {
      requireModulePermission(context, "common/currency:write");
      return insertCurrency(db, context, currencyValuesSchema.parse(input));
    },
    update(context: ModuleContext, publicId: string, input: unknown) {
      requireModulePermission(context, "common/currency:write");
      return updateCurrency(
        db,
        context,
        idSchema.parse(publicId),
        currencyValuesSchema.parse(input),
      );
    },
  };
}
