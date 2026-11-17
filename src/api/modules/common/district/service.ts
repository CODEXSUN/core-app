import { z } from "zod";
import type { Kysely } from "kysely";
import type { Database } from "../../../database/schema.ts";
import {
  requireModulePermission,
  type ModuleContext,
} from "../../../database/context.ts";
import { districtValuesSchema } from "../../../../../contracts/district.ts";
import {
  listDistrict,
  findDistrict,
  insertDistrict,
  updateDistrict,
} from "./repository.ts";

const idSchema = z.string().regex(/^[a-z0-9]{8}$/);
export function createDistrictService(db: Kysely<Database>) {
  return {
    list(context: ModuleContext) {
      requireModulePermission(context, "common/district:read");
      return listDistrict(db, context);
    },
    find(context: ModuleContext, publicId: string) {
      requireModulePermission(context, "common/district:read");
      return findDistrict(db, context, idSchema.parse(publicId));
    },
    create(context: ModuleContext, input: unknown) {
      requireModulePermission(context, "common/district:write");
      return insertDistrict(db, context, districtValuesSchema.parse(input));
    },
    update(context: ModuleContext, publicId: string, input: unknown) {
      requireModulePermission(context, "common/district:write");
      return updateDistrict(
        db,
        context,
        idSchema.parse(publicId),
        districtValuesSchema.parse(input),
      );
    },
  };
}
