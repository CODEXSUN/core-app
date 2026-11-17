import { sql, type Kysely } from "kysely";
import type { Database } from "../../../../../database/schema.ts";
import { taxValuesSchema } from "../../../../../../../contracts/tax.ts";
import { ownerPermissions } from "../../../../../../../contracts/permissions.ts";
import { generateTaxPublicId } from "../../repository.ts";

export const key = "common/tax";
export const dependencies: string[] = [];
export const policy = "reference";
// Reference values adapted from common/products/taxes/taxes.seed.ts. Placeholder business records are excluded.
const referenceData: Record<string, unknown>[] = [
  {
    ratePercent: 0,
    description: "0",
    name: "0% GST",
    sortOrder: 2,
  },
  {
    ratePercent: 5,
    description: "5",
    name: "5% GST",
    sortOrder: 3,
  },
  {
    ratePercent: 12,
    description: "12",
    name: "12% GST",
    sortOrder: 4,
  },
  {
    ratePercent: 18,
    description: "18",
    name: "18% GST",
    sortOrder: 5,
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

          const values = taxValuesSchema.parse({
            name: source.name,
            active: true,
            ratePercent: String(source.ratePercent ?? "0"),
            description: source.description,
            sortOrder: source.sortOrder,
          });
          const existing = await transaction
            .selectFrom("taxes")
            .select("id")
            .where("tenant_id", "=", scope.tenantId)
            .where(sql`lower(trim(name))`, "=", values.name.toLowerCase())
            .executeTakeFirst();
          if (existing) return false;
          await transaction
            .insertInto("taxes")
            .values({
              public_id: generateTaxPublicId(),
              tenant_id: scope.tenantId,
              name: values.name,
              active: true,
              rate_percent: values.ratePercent,
              description: values.description,
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
          failure.constraint !== "taxes_public_id_unique" ||
          attempt === 4
        )
          throw error;
      }
    }
  }
  return { policy, inserted, available: referenceData.length };
}
