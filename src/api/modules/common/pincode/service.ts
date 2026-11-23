import {softDeleteCoreRecord} from '../../../database/soft-delete.ts';
import{modulePageQuerySchema}from'../../../../../contracts/module-page.ts';
import{resolveCityReference}from'../city/index.ts';
import {pagePincodeRecords} from './repository.ts';
import { z } from "zod";
import type { Kysely } from "kysely";
import type { Database } from "../../../database/schema.ts";
import {
  requireModulePermission,
  type ModuleContext,
} from "../../../database/context.ts";
import { pincodeValuesSchema } from "../../../../../contracts/pincode.ts";
import {
  listPincode,
  findPincode,
  insertPincode,
  updatePincode,
} from "./repository.ts";

const idSchema = z.string().regex(/^[a-z0-9]{8}$/);
export function createPincodeService(db: Kysely<Database>) {
  return {
    remove(context: ModuleContext, publicId: string) {
      requireModulePermission(context, "common/pincode:delete");
      return softDeleteCoreRecord(db, context, "pincodes", idSchema.parse(publicId));
    },
    async page(context: ModuleContext,input:unknown){requireModulePermission(context,'common/pincode:read');const value=modulePageQuerySchema.parse(input),refs=z.object({cityId:idSchema.optional()}).strict().parse(value.references);if(refs.cityId)await resolveCityReference(db,context,refs.cityId);return pagePincodeRecords(db,context,value);},
    list(context: ModuleContext) {
      requireModulePermission(context, "common/pincode:read");
      return listPincode(db, context);
    },
    find(context: ModuleContext, publicId: string) {
      requireModulePermission(context, "common/pincode:read");
      return findPincode(db, context, idSchema.parse(publicId));
    },
    create(context: ModuleContext, input: unknown) {
      requireModulePermission(context, "common/pincode:write");
      return insertPincode(db, context, pincodeValuesSchema.parse(input));
    },
    update(context: ModuleContext, publicId: string, input: unknown) {
      requireModulePermission(context, "common/pincode:write");
      return updatePincode(
        db,
        context,
        idSchema.parse(publicId),
        pincodeValuesSchema.parse(input),
      );
    },
  };
}
