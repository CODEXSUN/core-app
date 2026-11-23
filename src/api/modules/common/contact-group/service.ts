import {softDeleteCoreRecord} from '../../../database/soft-delete.ts';
import {pageContactGroupRecords} from './repository.ts';
import { z } from "zod";
import type { Kysely } from "kysely";
import type { Database } from "../../../database/schema.ts";
import {
  requireModulePermission,
  type ModuleContext,
} from "../../../database/context.ts";
import { contactGroupValuesSchema } from "../../../../../contracts/contact-group.ts";
import {
  listContactGroup,
  findContactGroup,
  insertContactGroup,
  updateContactGroup,
} from "./repository.ts";

const idSchema = z.string().regex(/^[a-z0-9]{8}$/);
export function createContactGroupService(db: Kysely<Database>) {
  return {
    remove(context: ModuleContext, publicId: string) {
      requireModulePermission(context, "common/contact-group:delete");
      return softDeleteCoreRecord(db, context, "contact_groups", idSchema.parse(publicId));
    },
    page(context: ModuleContext,input:unknown){requireModulePermission(context,'common/contact-group:read');return pageContactGroupRecords(db,context,input);},
    list(context: ModuleContext) {
      requireModulePermission(context, "common/contact-group:read");
      return listContactGroup(db, context);
    },
    find(context: ModuleContext, publicId: string) {
      requireModulePermission(context, "common/contact-group:read");
      return findContactGroup(db, context, idSchema.parse(publicId));
    },
    create(context: ModuleContext, input: unknown) {
      requireModulePermission(context, "common/contact-group:write");
      return insertContactGroup(
        db,
        context,
        contactGroupValuesSchema.parse(input),
      );
    },
    update(context: ModuleContext, publicId: string, input: unknown) {
      requireModulePermission(context, "common/contact-group:write");
      return updateContactGroup(
        db,
        context,
        idSchema.parse(publicId),
        contactGroupValuesSchema.parse(input),
      );
    },
  };
}
