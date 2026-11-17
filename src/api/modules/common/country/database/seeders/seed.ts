import { sql, type Kysely } from "kysely";
import type { Database } from "../../../../../database/schema.ts";
import { countryValuesSchema } from "../../../../../../../contracts/country.ts";
import { ownerPermissions } from "../../../../../../../contracts/permissions.ts";
import { generateCountryPublicId } from "../../repository.ts";

export const key = "common/country";
export const dependencies: string[] = [];
export const policy = "reference";
// Reference values adapted from common/location/country/country.seed.ts. Placeholder business records are excluded.
const referenceData: Record<string, unknown>[] = [
  {
    code: "IN",
    name: "India",
    sortOrder: 0,
    status: "active",
  },
  {
    code: "US",
    name: "United States",
    sortOrder: 20,
    status: "active",
  },
  {
    code: "GB",
    name: "United Kingdom",
    sortOrder: 30,
    status: "active",
  },
  {
    code: "AE",
    name: "United Arab Emirates",
    sortOrder: 40,
    status: "active",
  },
  {
    code: "SG",
    name: "Singapore",
    sortOrder: 50,
    status: "active",
  },
  {
    code: "AU",
    name: "Australia",
    sortOrder: 60,
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

          const values = countryValuesSchema.parse({
            name: source.name,
            active: true,
            code: source.code,
            sortOrder: source.sortOrder,
          });
          const existing = await transaction
            .selectFrom("countries")
            .select("id")
            .where("tenant_id", "=", scope.tenantId)
            .where(sql`lower(trim(code))`, "=", values.code.toLowerCase())
            .executeTakeFirst();
          if (existing) return false;
          await transaction
            .insertInto("countries")
            .values({
              public_id: generateCountryPublicId(),
              tenant_id: scope.tenantId,
              name: values.name,
              active: true,
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
          failure.constraint !== "countries_public_id_unique" ||
          attempt === 4
        )
          throw error;
      }
    }
  }
  return { policy, inserted, available: referenceData.length };
}
