import { sql, type Kysely } from "kysely";
import type { Database } from "../../../../../database/schema.ts";
import { cityValuesSchema } from "../../../../../../../contracts/city.ts";
import { ownerPermissions } from "../../../../../../../contracts/permissions.ts";
import { generateCityPublicId } from "../../repository.ts";
import {
  listDistrictRecords,
  resolveDistrictReference,
} from "../../../../common/district/index.ts";
export const key = "common/city";
export const dependencies: string[] = ["common/district"];
export const policy = "reference";
// Reference values adapted from common/location/city/city.seed.ts. Placeholder business records are excluded.
const referenceData: Record<string, unknown>[] = [
  {
    name: "Chennai",
    districtName: "Chennai",
    sortOrder: 1,
    status: "active",
  },
  {
    name: "Coimbatore",
    districtName: "Coimbatore",
    sortOrder: 2,
    status: "active",
  },
  {
    name: "Tiruppur",
    districtName: "Tiruppur",
    sortOrder: 3,
    status: "active",
  },
  {
    name: "Madurai",
    districtName: "Madurai",
    sortOrder: 4,
    status: "active",
  },
  {
    name: "Salem",
    districtName: "Salem",
    sortOrder: 5,
    status: "active",
  },
  {
    name: "Erode",
    districtName: "Erode",
    sortOrder: 6,
    status: "active",
  },
  {
    name: "Tiruchirappalli",
    districtName: "Tiruchirappalli",
    sortOrder: 7,
    status: "active",
  },
  {
    name: "Tirunelveli",
    districtName: "Tirunelveli",
    sortOrder: 8,
    status: "active",
  },
  {
    name: "Thoothukudi",
    districtName: "Thoothukudi",
    sortOrder: 9,
    status: "active",
  },
  {
    name: "Vellore",
    districtName: "Vellore",
    sortOrder: 10,
    status: "active",
  },
  {
    name: "Hosur",
    districtName: "Krishnagiri",
    sortOrder: 11,
    status: "active",
  },
  {
    name: "Nagercoil",
    districtName: "Kanniyakumari",
    sortOrder: 12,
    status: "active",
  },
  {
    name: "Thanjavur",
    districtName: "Thanjavur",
    sortOrder: 13,
    status: "active",
  },
  {
    name: "Dindigul",
    districtName: "Dindigul",
    sortOrder: 14,
    status: "active",
  },
  {
    name: "Karur",
    districtName: "Karur",
    sortOrder: 15,
    status: "active",
  },
  {
    name: "Namakkal",
    districtName: "Namakkal",
    sortOrder: 16,
    status: "active",
  },
  {
    name: "Cuddalore",
    districtName: "Cuddalore",
    sortOrder: 17,
    status: "active",
  },
  {
    name: "Kancheepuram",
    districtName: "Kancheepuram",
    sortOrder: 18,
    status: "active",
  },
  {
    name: "Tiruvallur",
    districtName: "Tiruvallur",
    sortOrder: 19,
    status: "active",
  },
  {
    name: "Udumalpet",
    districtName: "Tiruppur",
    sortOrder: 20,
    status: "active",
  },
  {
    name: "Pollachi",
    districtName: "Coimbatore",
    sortOrder: 21,
    status: "active",
  },
  {
    name: "Avinashi",
    districtName: "Tiruppur",
    sortOrder: 22,
    status: "active",
  },
];
export async function seed(
  db: Kysely<Database>,
  context: { environment: string; demo: boolean; tenantId?: string },
) {
  if (!context.tenantId)
    return {
      policy,
      inserted: 0,
      available: referenceData.length,
      skipped: "Supply an explicit tenant to install reference data.",
    };
  const scope = {
    tenantId: context.tenantId,
    actorId: "system:core-reference-seed",
    permissions: ownerPermissions,
  };
  let inserted = 0;
  for (const source of referenceData) {
    for (let attempt = 0; attempt < 5; attempt++) {
      try {
        const added = await db.transaction().execute(async (transaction) => {
          await sql`select pg_advisory_xact_lock(hashtextextended(${scope.tenantId + ":reference-seed"},0))`.execute(
            transaction,
          );
          const candidates = await listDistrictRecords(transaction, scope);
          const selected = candidates.find(
            (row) => row.name === source.districtName,
          );
          if (!selected)
            throw new Error("Seed dependency district is missing.");
          const districtId = await resolveDistrictReference(
            transaction,
            scope,
            selected.public_id,
          );
          const values = cityValuesSchema.parse({
            name: source.name,
            active: true,
            districtId: districtId.public_id,
            sortOrder: source.sortOrder,
          });
          const existing = await transaction
            .selectFrom("cities")
            .select("id")
            .where("tenant_id", "=", scope.tenantId)
            .where(sql`lower(trim(name))`, "=", values.name.toLowerCase())
            .where("district_id", "=", districtId.id)
            .executeTakeFirst();
          if (existing) return false;
          await transaction
            .insertInto("cities")
            .values({
              public_id: generateCityPublicId(),
              tenant_id: scope.tenantId,
              name: values.name,
              active: true,
              district_id: districtId.id,
              sort_order: values.sortOrder,
              created_by: scope.actorId,
              updated_by: scope.actorId,
              deleted_at: null,
              deleted_by: null,
            })
            .execute();
          return true;
        });
        if (added) inserted++;
        break;
      } catch (error) {
        const failure = error as { code?: string; constraint?: string };
        if (
          failure.code !== "23505" ||
          failure.constraint !== "cities_public_id_unique" ||
          attempt === 4
        )
          throw error;
      }
    }
  }
  return { policy, inserted, available: referenceData.length };
}
