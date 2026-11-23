import {softDeleteCoreRecord} from '../../../database/soft-delete.ts';
import {pageAddressTypeRecords} from './repository.ts';
import { z } from "zod";
import type { Kysely } from "kysely";
import type { Database } from "../../../database/schema.ts";
import {
  requireModulePermission,
  type ModuleContext,
} from "../../../database/context.ts";
import { addressTypeValuesSchema } from "../../../../../contracts/address-type.ts";
import {
  listAddressType,
  findAddressType,
  insertAddressType,
  updateAddressType,
} from "./repository.ts";

const idSchema = z.string().regex(/^[a-z0-9]{8}$/);
export function createAddressTypeService(db: Kysely<Database>) {
  return {
    remove(context: ModuleContext, publicId: string) {
      requireModulePermission(context, "common/address-type:delete");
      return softDeleteCoreRecord(db, context, "address_types", idSchema.parse(publicId));
    },
    page(context: ModuleContext,input:unknown){requireModulePermission(context,'common/address-type:read');return pageAddressTypeRecords(db,context,input);},
    list(context: ModuleContext) {
      requireModulePermission(context, "common/address-type:read");
      return listAddressType(db, context);
    },
    find(context: ModuleContext, publicId: string) {
      requireModulePermission(context, "common/address-type:read");
      return findAddressType(db, context, idSchema.parse(publicId));
    },
    create(context: ModuleContext, input: unknown) {
      requireModulePermission(context, "common/address-type:write");
      return insertAddressType(
        db,
        context,
        addressTypeValuesSchema.parse(input),
      );
    },
    update(context: ModuleContext, publicId: string, input: unknown) {
      requireModulePermission(context, "common/address-type:write");
      return updateAddressType(
        db,
        context,
        idSchema.parse(publicId),
        addressTypeValuesSchema.parse(input),
      );
    },
  };
}
