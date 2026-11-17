import { sql, type Kysely } from "kysely";
import type { Database } from "../../../../../database/schema.ts";
import { salesTypeValuesSchema } from "../../../../../../../contracts/sales-type.ts";
import { ownerPermissions } from "../../../../../../../contracts/permissions.ts";
import { generateSalesTypePublicId } from "../../repository.ts";

export const key = "common/sales-type";
export const dependencies: string[] = [];
export const policy = "reference";
// Reference values adapted from common/others/sales-types/sales-types.seed.ts. Placeholder business records are excluded.
const referenceData: Record<string, unknown>[] = [
  {
    name: "Retail",
    description: "Retail sale",
    sortOrder: 2,
  },
  {
    name: "Wholesale",
    description: "Wholesale sale",
    sortOrder: 3,
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

          const values = salesTypeValuesSchema.parse({
            name: source.name,
            active: true,
            description: source.description,
            sortOrder: source.sortOrder,
          });
          const existing = await transaction
            .selectFrom("sales_types")
            .select("id")
            .where("tenant_id", "=", scope.tenantId)
            .where(sql`lower(trim(name))`, "=", values.name.toLowerCase())
            .executeTakeFirst();
          if (existing) return false;
          await transaction
            .insertInto("sales_types")
            .values({
              public_id: generateSalesTypePublicId(),
              tenant_id: scope.tenantId,
              name: values.name,
              active: true,
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
          failure.constraint !== "sales_types_public_id_unique" ||
          attempt === 4
        )
          throw error;
      }
    }
  }
  return { policy, inserted, available: referenceData.length };
}
