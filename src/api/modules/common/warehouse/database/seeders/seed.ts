import { sql, type Kysely } from "kysely";
import type { Database } from "../../../../../database/schema.ts";
import { warehouseValuesSchema } from "../../../../../../../contracts/warehouse.ts";
import { ownerPermissions } from "../../../../../../../contracts/permissions.ts";
import { generateWarehousePublicId } from "../../repository.ts";

export const key = "common/warehouse";
export const dependencies: string[] = [];
export const policy = "reference";
// Reference values adapted from common/workorder/warehouses/warehouses.seed.ts. Placeholder business records are excluded.
const referenceData: Record<string, unknown>[] = [
  {
    name: "Main Warehouse",
    sortOrder: 2,
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

          const values = warehouseValuesSchema.parse({
            name: source.name,
            active: true,
            sortOrder: source.sortOrder,
          });
          const existing = await transaction
            .selectFrom("warehouses")
            .select("id")
            .where("tenant_id", "=", scope.tenantId)
            .where(sql`lower(trim(name))`, "=", values.name.toLowerCase())
            .executeTakeFirst();
          if (existing) return false;
          await transaction
            .insertInto("warehouses")
            .values({
              public_id: generateWarehousePublicId(),
              tenant_id: scope.tenantId,
              name: values.name,
              active: true,
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
          failure.constraint !== "warehouses_public_id_unique" ||
          attempt === 4
        )
          throw error;
      }
    }
  }
  return { policy, inserted, available: referenceData.length };
}
