import {softDeleteCoreRecord} from '../../../database/soft-delete.ts';
import {pageLedgerRecords} from './repository.ts';
import { z } from "zod";
import type { Kysely } from "kysely";
import type { Database } from "../../../database/schema.ts";
import {
  requireModulePermission,
  type ModuleContext,
} from "../../../database/context.ts";
import { ledgerValuesSchema } from "../../../../../contracts/ledger.ts";
import {
  listLedger,
  findLedger,
  insertLedger,
  updateLedger,
} from "./repository.ts";

const idSchema = z.string().regex(/^[a-z0-9]{8}$/);
export function createLedgerService(db: Kysely<Database>) {
  return {
    remove(context: ModuleContext, publicId: string) {
      requireModulePermission(context, "common/ledger:delete");
      return softDeleteCoreRecord(db, context, "ledgers", idSchema.parse(publicId));
    },
    page(context: ModuleContext,input:unknown){requireModulePermission(context,'common/ledger:read');return pageLedgerRecords(db,context,input);},
    list(context: ModuleContext) {
      requireModulePermission(context, "common/ledger:read");
      return listLedger(db, context);
    },
    find(context: ModuleContext, publicId: string) {
      requireModulePermission(context, "common/ledger:read");
      return findLedger(db, context, idSchema.parse(publicId));
    },
    create(context: ModuleContext, input: unknown) {
      requireModulePermission(context, "common/ledger:write");
      return insertLedger(db, context, ledgerValuesSchema.parse(input));
    },
    update(context: ModuleContext, publicId: string, input: unknown) {
      requireModulePermission(context, "common/ledger:write");
      return updateLedger(
        db,
        context,
        idSchema.parse(publicId),
        ledgerValuesSchema.parse(input),
      );
    },
  };
}
