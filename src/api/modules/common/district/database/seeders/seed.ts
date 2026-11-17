import { sql, type Kysely } from "kysely";
import type { Database } from "../../../../../database/schema.ts";
import { districtValuesSchema } from "../../../../../../../contracts/district.ts";
import { ownerPermissions } from "../../../../../../../contracts/permissions.ts";
import { generateDistrictPublicId } from "../../repository.ts";
import {
  listStateRecords,
  resolveStateReference,
} from "../../../../common/state/index.ts";
export const key = "common/district";
export const dependencies: string[] = ["common/state"];
export const policy = "reference";
// Reference values adapted from common/location/district/district.seed.ts. Placeholder business records are excluded.
const referenceData: Record<string, unknown>[] = [
  {
    name: "Ariyalur",
    sortOrder: 1,
    status: "active",
  },
  {
    name: "Chengalpattu",
    sortOrder: 2,
    status: "active",
  },
  {
    name: "Chennai",
    sortOrder: 3,
    status: "active",
  },
  {
    name: "Coimbatore",
    sortOrder: 4,
    status: "active",
  },
  {
    name: "Cuddalore",
    sortOrder: 5,
    status: "active",
  },
  {
    name: "Dharmapuri",
    sortOrder: 6,
    status: "active",
  },
  {
    name: "Dindigul",
    sortOrder: 7,
    status: "active",
  },
  {
    name: "Erode",
    sortOrder: 8,
    status: "active",
  },
  {
    name: "Kallakurichi",
    sortOrder: 9,
    status: "active",
  },
  {
    name: "Kancheepuram",
    sortOrder: 10,
    status: "active",
  },
  {
    name: "Karur",
    sortOrder: 11,
    status: "active",
  },
  {
    name: "Krishnagiri",
    sortOrder: 12,
    status: "active",
  },
  {
    name: "Madurai",
    sortOrder: 13,
    status: "active",
  },
  {
    name: "Mayiladuthurai",
    sortOrder: 14,
    status: "active",
  },
  {
    name: "Nagapattinam",
    sortOrder: 15,
    status: "active",
  },
  {
    name: "Kanniyakumari",
    sortOrder: 16,
    status: "active",
  },
  {
    name: "Namakkal",
    sortOrder: 17,
    status: "active",
  },
  {
    name: "Perambalur",
    sortOrder: 18,
    status: "active",
  },
  {
    name: "Pudukkottai",
    sortOrder: 19,
    status: "active",
  },
  {
    name: "Ramanathapuram",
    sortOrder: 20,
    status: "active",
  },
  {
    name: "Ranipet",
    sortOrder: 21,
    status: "active",
  },
  {
    name: "Salem",
    sortOrder: 22,
    status: "active",
  },
  {
    name: "Sivaganga",
    sortOrder: 23,
    status: "active",
  },
  {
    name: "Tenkasi",
    sortOrder: 24,
    status: "active",
  },
  {
    name: "Thanjavur",
    sortOrder: 25,
    status: "active",
  },
  {
    name: "Theni",
    sortOrder: 26,
    status: "active",
  },
  {
    name: "Thoothukudi",
    sortOrder: 27,
    status: "active",
  },
  {
    name: "Tiruchirappalli",
    sortOrder: 28,
    status: "active",
  },
  {
    name: "Tirunelveli",
    sortOrder: 29,
    status: "active",
  },
  {
    name: "Tirupathur",
    sortOrder: 30,
    status: "active",
  },
  {
    name: "Tiruppur",
    sortOrder: 31,
    status: "active",
  },
  {
    name: "Tiruvallur",
    sortOrder: 32,
    status: "active",
  },
  {
    name: "Tiruvannamalai",
    sortOrder: 33,
    status: "active",
  },
  {
    name: "Tiruvarur",
    sortOrder: 34,
    status: "active",
  },
  {
    name: "Vellore",
    sortOrder: 35,
    status: "active",
  },
  {
    name: "Viluppuram",
    sortOrder: 36,
    status: "active",
  },
  {
    name: "Virudhunagar",
    sortOrder: 37,
    status: "active",
  },
  {
    name: "The Nilgiris",
    sortOrder: 38,
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
          const candidates = await listStateRecords(transaction, scope);
          const selected = candidates.find((row) => row.name === "Tamil Nadu");
          if (!selected) throw new Error("Seed dependency state is missing.");
          const stateId = await resolveStateReference(
            transaction,
            scope,
            selected.public_id,
          );
          const values = districtValuesSchema.parse({
            name: source.name,
            active: true,
            stateId: stateId.public_id,
            sortOrder: source.sortOrder,
          });
          const existing = await transaction
            .selectFrom("districts")
            .select("id")
            .where("tenant_id", "=", scope.tenantId)
            .where(sql`lower(trim(name))`, "=", values.name.toLowerCase())
            .where("state_id", "=", stateId.id)
            .executeTakeFirst();
          if (existing) return false;
          await transaction
            .insertInto("districts")
            .values({
              public_id: generateDistrictPublicId(),
              tenant_id: scope.tenantId,
              name: values.name,
              active: true,
              state_id: stateId.id,
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
          failure.constraint !== "districts_public_id_unique" ||
          attempt === 4
        )
          throw error;
      }
    }
  }
  return { policy, inserted, available: referenceData.length };
}
