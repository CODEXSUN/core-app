import { z } from "zod";
import type { Kysely } from "kysely";
import type { Database } from "../../../database/schema.ts";
import {
  requireModulePermission,
  type ModuleContext,
} from "../../../database/context.ts";
import { contactTypeValuesSchema } from "../../../../../contracts/contact-type.ts";
import {
  listContactType,
  findContactType,
  insertContactType,
  updateContactType,
} from "./repository.ts";

const idSchema = z.string().regex(/^[a-z0-9]{8}$/);
export function createContactTypeService(db: Kysely<Database>) {
  return {
    list(context: ModuleContext) {
      requireModulePermission(context, "common/contact-type:read");
      return listContactType(db, context);
    },
    find(context: ModuleContext, publicId: string) {
      requireModulePermission(context, "common/contact-type:read");
      return findContactType(db, context, idSchema.parse(publicId));
    },
    create(context: ModuleContext, input: unknown) {
      requireModulePermission(context, "common/contact-type:write");
      return insertContactType(
        db,
        context,
        contactTypeValuesSchema.parse(input),
      );
    },
    update(context: ModuleContext, publicId: string, input: unknown) {
      requireModulePermission(context, "common/contact-type:write");
      return updateContactType(
        db,
        context,
        idSchema.parse(publicId),
        contactTypeValuesSchema.parse(input),
      );
    },
  };
}
