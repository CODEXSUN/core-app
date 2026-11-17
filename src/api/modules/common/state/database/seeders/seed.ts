import { sql, type Kysely } from "kysely";
import type { Database } from "../../../../../database/schema.ts";
import { stateValuesSchema } from "../../../../../../../contracts/state.ts";
import { ownerPermissions } from "../../../../../../../contracts/permissions.ts";
import { generateStatePublicId } from "../../repository.ts";
import {
  listCountryRecords,
  resolveCountryReference,
} from "../../../../common/country/index.ts";
export const key = "common/state";
export const dependencies: string[] = ["common/country"];
export const policy = "reference";
// Reference values adapted from common/location/state/state.seed.ts. Placeholder business records are excluded.
const referenceData: Record<string, unknown>[] = [
  {
    code: "01",
    name: "Jammu and Kashmir",
    sortOrder: 1,
    status: "active",
  },
  {
    code: "02",
    name: "Himachal Pradesh",
    sortOrder: 2,
    status: "active",
  },
  {
    code: "03",
    name: "Punjab",
    sortOrder: 3,
    status: "active",
  },
  {
    code: "04",
    name: "Chandigarh",
    sortOrder: 4,
    status: "active",
  },
  {
    code: "05",
    name: "Uttarakhand",
    sortOrder: 5,
    status: "active",
  },
  {
    code: "06",
    name: "Haryana",
    sortOrder: 6,
    status: "active",
  },
  {
    code: "07",
    name: "Delhi",
    sortOrder: 7,
    status: "active",
  },
  {
    code: "08",
    name: "Rajasthan",
    sortOrder: 8,
    status: "active",
  },
  {
    code: "09",
    name: "Uttar Pradesh",
    sortOrder: 9,
    status: "active",
  },
  {
    code: "10",
    name: "Bihar",
    sortOrder: 10,
    status: "active",
  },
  {
    code: "11",
    name: "Sikkim",
    sortOrder: 11,
    status: "active",
  },
  {
    code: "12",
    name: "Arunachal Pradesh",
    sortOrder: 12,
    status: "active",
  },
  {
    code: "13",
    name: "Nagaland",
    sortOrder: 13,
    status: "active",
  },
  {
    code: "14",
    name: "Manipur",
    sortOrder: 14,
    status: "active",
  },
  {
    code: "15",
    name: "Mizoram",
    sortOrder: 15,
    status: "active",
  },
  {
    code: "16",
    name: "Tripura",
    sortOrder: 16,
    status: "active",
  },
  {
    code: "17",
    name: "Meghalaya",
    sortOrder: 17,
    status: "active",
  },
  {
    code: "18",
    name: "Assam",
    sortOrder: 18,
    status: "active",
  },
  {
    code: "19",
    name: "West Bengal",
    sortOrder: 19,
    status: "active",
  },
  {
    code: "20",
    name: "Jharkhand",
    sortOrder: 20,
    status: "active",
  },
  {
    code: "21",
    name: "Odisha",
    sortOrder: 21,
    status: "active",
  },
  {
    code: "22",
    name: "Chhattisgarh",
    sortOrder: 22,
    status: "active",
  },
  {
    code: "23",
    name: "Madhya Pradesh",
    sortOrder: 23,
    status: "active",
  },
  {
    code: "24",
    name: "Gujarat",
    sortOrder: 24,
    status: "active",
  },
  {
    code: "26",
    name: "Dadra and Nagar Haveli and Daman and Diu",
    sortOrder: 26,
    status: "active",
  },
  {
    code: "27",
    name: "Maharashtra",
    sortOrder: 27,
    status: "active",
  },
  {
    code: "29",
    name: "Karnataka",
    sortOrder: 29,
    status: "active",
  },
  {
    code: "30",
    name: "Goa",
    sortOrder: 30,
    status: "active",
  },
  {
    code: "31",
    name: "Lakshadweep",
    sortOrder: 31,
    status: "active",
  },
  {
    code: "32",
    name: "Kerala",
    sortOrder: 32,
    status: "active",
  },
  {
    code: "33",
    name: "Tamil Nadu",
    sortOrder: 33,
    status: "active",
  },
  {
    code: "34",
    name: "Puducherry",
    sortOrder: 34,
    status: "active",
  },
  {
    code: "35",
    name: "Andaman and Nicobar Islands",
    sortOrder: 35,
    status: "active",
  },
  {
    code: "36",
    name: "Telangana",
    sortOrder: 36,
    status: "active",
  },
  {
    code: "37",
    name: "Andhra Pradesh",
    sortOrder: 37,
    status: "active",
  },
  {
    code: "38",
    name: "Ladakh",
    sortOrder: 38,
    status: "active",
  },
  {
    code: "97",
    name: "Other Territory",
    sortOrder: 97,
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
          const candidates = await listCountryRecords(transaction, scope);
          const selected = candidates.find((row) => row.code === "IN");
          if (!selected) throw new Error("Seed dependency country is missing.");
          const countryId = await resolveCountryReference(
            transaction,
            scope,
            selected.public_id,
          );
          const values = stateValuesSchema.parse({
            name: source.name,
            active: true,
            countryId: countryId.public_id,
            code: source.code,
            sortOrder: source.sortOrder,
          });
          const existing = await transaction
            .selectFrom("states")
            .select("id")
            .where("tenant_id", "=", scope.tenantId)
            .where(sql`lower(trim(code))`, "=", values.code.toLowerCase())
            .where("country_id", "=", countryId.id)
            .executeTakeFirst();
          if (existing) return false;
          await transaction
            .insertInto("states")
            .values({
              public_id: generateStatePublicId(),
              tenant_id: scope.tenantId,
              name: values.name,
              active: true,
              country_id: countryId.id,
              code: values.code,
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
          failure.constraint !== "states_public_id_unique" ||
          attempt === 4
        )
          throw error;
      }
    }
  }
  return { policy, inserted, available: referenceData.length };
}
