import { sql, type Kysely } from "kysely";
import type { Database } from "../../../../../database/schema.ts";
import { monthValuesSchema } from "../../../../../../../contracts/month.ts";
import { ownerPermissions } from "../../../../../../../contracts/permissions.ts";
import { generateMonthPublicId } from "../../repository.ts";

export const key = "common/month";
export const dependencies: string[] = [];
export const policy = "reference";
// Reference values adapted from common/others/months/months.seed.ts. Placeholder business records are excluded.
const referenceData: Record<string, unknown>[] = [
  {
    name: "April-2026",
    startDate: "2026-04-01",
    endDate: "2026-04-30",
    sortOrder: 2,
  },
  {
    name: "May-2026",
    startDate: "2026-05-01",
    endDate: "2026-05-31",
    sortOrder: 3,
  },
  {
    name: "June-2026",
    startDate: "2026-06-01",
    endDate: "2026-06-30",
    sortOrder: 4,
  },
  {
    name: "July-2026",
    startDate: "2026-07-01",
    endDate: "2026-07-31",
    sortOrder: 5,
  },
  {
    name: "August-2026",
    startDate: "2026-08-01",
    endDate: "2026-08-31",
    sortOrder: 6,
  },
  {
    name: "September-2026",
    startDate: "2026-09-01",
    endDate: "2026-09-30",
    sortOrder: 7,
  },
  {
    name: "October-2026",
    startDate: "2026-10-01",
    endDate: "2026-10-31",
    sortOrder: 8,
  },
  {
    name: "November-2026",
    startDate: "2026-11-01",
    endDate: "2026-11-30",
    sortOrder: 9,
  },
  {
    name: "December-2026",
    startDate: "2026-12-01",
    endDate: "2026-12-31",
    sortOrder: 10,
  },
  {
    name: "January-2027",
    startDate: "2027-01-01",
    endDate: "2027-01-31",
    sortOrder: 11,
  },
  {
    name: "February-2027",
    startDate: "2027-02-01",
    endDate: "2027-02-28",
    sortOrder: 12,
  },
  {
    name: "March-2027",
    startDate: "2027-03-01",
    endDate: "2027-03-31",
    sortOrder: 13,
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

          const values = monthValuesSchema.parse({
            name: source.name,
            active: true,
            startDate: source.startDate,
            endDate: source.endDate,
            sortOrder: source.sortOrder,
          });
          const existing = await transaction
            .selectFrom("months")
            .select("id")
            .where("tenant_id", "=", scope.tenantId)
            .where(sql`lower(trim(name))`, "=", values.name.toLowerCase())
            .executeTakeFirst();
          if (existing) return false;
          await transaction
            .insertInto("months")
            .values({
              public_id: generateMonthPublicId(),
              tenant_id: scope.tenantId,
              name: values.name,
              active: true,
              start_date: values.startDate,
              end_date: values.endDate,
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
          failure.constraint !== "months_public_id_unique" ||
          attempt === 4
        )
          throw error;
      }
    }
  }
  return { policy, inserted, available: referenceData.length };
}
