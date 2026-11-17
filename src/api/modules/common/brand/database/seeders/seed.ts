import { sql, type Kysely } from "kysely";
import type { Database } from "../../../../../database/schema.ts";
import { brandValuesSchema } from "../../../../../../../contracts/brand.ts";
import { ownerPermissions } from "../../../../../../../contracts/permissions.ts";
import { generateBrandPublicId } from "../../repository.ts";

export const key = "common/brand";
export const dependencies: string[] = [];
export const policy = "reference";
// Reference values adapted from common/products/brands/brands.seed.ts. Placeholder business records are excluded.
const referenceData: Record<string, unknown>[] = [
  {
    name: "General",
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

          const values = brandValuesSchema.parse({
            name: source.name,
            active: true,
            logoUrl: source.logoUrl,
            logoAlt: source.logoAlt,
            showOnStorefront: source.showOnStorefront,
            sortOrder: source.sortOrder,
          });
          const existing = await transaction
            .selectFrom("brands")
            .select("id")
            .where("tenant_id", "=", scope.tenantId)
            .where(sql`lower(trim(name))`, "=", values.name.toLowerCase())
            .executeTakeFirst();
          if (existing) return false;
          await transaction
            .insertInto("brands")
            .values({
              public_id: generateBrandPublicId(),
              tenant_id: scope.tenantId,
              name: values.name,
              active: true,
              logo_url: values.logoUrl,
              logo_alt: values.logoAlt,
              show_on_storefront: values.showOnStorefront,
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
          failure.constraint !== "brands_public_id_unique" ||
          attempt === 4
        )
          throw error;
      }
    }
  }
  return { policy, inserted, available: referenceData.length };
}
