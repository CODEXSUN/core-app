import {softDeleteCoreRecord} from '../../../database/soft-delete.ts';
import {pageLedgerGroupRecords} from './repository.ts';
import { z } from "zod";
import type { Kysely } from "kysely";
import type { Database } from "../../../database/schema.ts";
import {
  requireModulePermission,
  type ModuleContext,
} from "../../../database/context.ts";
import { ledgerGroupValuesSchema } from "../../../../../contracts/ledger-group.ts";
import {
  listLedgerGroup,
  findLedgerGroup,
  insertLedgerGroup,
  updateLedgerGroup,
} from "./repository.ts";

const idSchema = z.string().regex(/^[a-z0-9]{8}$/);
export function createLedgerGroupService(db: Kysely<Database>) {
  return {
    remove(context: ModuleContext, publicId: string) {
      requireModulePermission(context, "common/ledger-group:delete");
      return softDeleteCoreRecord(db, context, "ledger_groups", idSchema.parse(publicId));
    },
    page(context: ModuleContext,input:unknown){requireModulePermission(context,'common/ledger-group:read');return pageLedgerGroupRecords(db,context,input);},
    list(context: ModuleContext) {
      requireModulePermission(context, "common/ledger-group:read");
      return listLedgerGroup(db, context);
    },
    find(context: ModuleContext, publicId: string) {
      requireModulePermission(context, "common/ledger-group:read");
      return findLedgerGroup(db, context, idSchema.parse(publicId));
    },
    create(context: ModuleContext, input: unknown) {
      requireModulePermission(context, "common/ledger-group:write");
      return insertLedgerGroup(
        db,
        context,
        ledgerGroupValuesSchema.parse(input),
      );
    },
    update(context: ModuleContext, publicId: string, input: unknown) {
      requireModulePermission(context, "common/ledger-group:write");
      return updateLedgerGroup(
        db,
        context,
        idSchema.parse(publicId),
        ledgerGroupValuesSchema.parse(input),
      );
    },
  };
}
