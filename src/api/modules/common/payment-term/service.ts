import {pagePaymentTermRecords} from './repository.ts';
import { z } from "zod";
import type { Kysely } from "kysely";
import type { Database } from "../../../database/schema.ts";
import {
  requireModulePermission,
  type ModuleContext,
} from "../../../database/context.ts";
import { paymentTermValuesSchema } from "../../../../../contracts/payment-term.ts";
import {
  listPaymentTerm,
  findPaymentTerm,
  insertPaymentTerm,
  updatePaymentTerm,
} from "./repository.ts";

const idSchema = z.string().regex(/^[a-z0-9]{8}$/);
export function createPaymentTermService(db: Kysely<Database>) {
  return {
    page(context: ModuleContext,input:unknown){requireModulePermission(context,'common/payment-term:read');return pagePaymentTermRecords(db,context,input);},
    list(context: ModuleContext) {
      requireModulePermission(context, "common/payment-term:read");
      return listPaymentTerm(db, context);
    },
    find(context: ModuleContext, publicId: string) {
      requireModulePermission(context, "common/payment-term:read");
      return findPaymentTerm(db, context, idSchema.parse(publicId));
    },
    create(context: ModuleContext, input: unknown) {
      requireModulePermission(context, "common/payment-term:write");
      return insertPaymentTerm(
        db,
        context,
        paymentTermValuesSchema.parse(input),
      );
    },
    update(context: ModuleContext, publicId: string, input: unknown) {
      requireModulePermission(context, "common/payment-term:write");
      return updatePaymentTerm(
        db,
        context,
        idSchema.parse(publicId),
        paymentTermValuesSchema.parse(input),
      );
    },
  };
}
