import { z } from "zod";
import type { Kysely } from "kysely";
import type { Database } from "../../../database/schema.ts";
import {
  requireModulePermission,
  type ModuleContext,
} from "../../../database/context.ts";
import { contactValuesSchema } from "../../../../../contracts/contact.ts";
import {
  listContact,
  findContact,
  insertContact,
  updateContact,
} from "./repository.ts";

const idSchema = z.string().regex(/^[a-z0-9]{8}$/);
export function createContactService(db: Kysely<Database>) {
  return {
    list(context: ModuleContext) {
      requireModulePermission(context, "master/contact:read");
      return listContact(db, context);
    },
    find(context: ModuleContext, publicId: string) {
      requireModulePermission(context, "master/contact:read");
      return findContact(db, context, idSchema.parse(publicId));
    },
    create(context: ModuleContext, input: unknown) {
      requireModulePermission(context, "master/contact:write");
      return insertContact(db, context, contactValuesSchema.parse(input));
    },
    update(context: ModuleContext, publicId: string, input: unknown) {
      requireModulePermission(context, "master/contact:write");
      return updateContact(
        db,
        context,
        idSchema.parse(publicId),
        contactValuesSchema.parse(input),
      );
    },
  };
}
