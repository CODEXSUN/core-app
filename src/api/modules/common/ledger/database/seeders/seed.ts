import { sql, type Kysely } from "kysely";
import type { Database } from "../../../../../database/schema.ts";
import { ledgerValuesSchema } from "../../../../../../../contracts/ledger.ts";
import { ownerPermissions } from "../../../../../../../contracts/permissions.ts";
import { generateLedgerPublicId } from "../../repository.ts";
import {
  listLedgerGroupRecords,
  resolveLedgerGroupReference,
} from "../../../../common/ledger-group/index.ts";
export const key = "common/ledger";
export const dependencies: string[] = ["common/ledger-group"];
export const policy = "reference";
// Reference values adapted from common/accounts/ledgers/ledgers.seed.ts. Placeholder business records are excluded.
const referenceData: Record<string, unknown>[] = [
  {
    name: "General",
    groupName: "General",
    sortOrder: 1,
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
          const candidates = await listLedgerGroupRecords(transaction, scope);
          const selected = candidates.find(
            (row) => row.name === source.groupName,
          );
          if (!selected)
            throw new Error("Seed dependency ledger-group is missing.");
          const ledgerGroupId = await resolveLedgerGroupReference(
            transaction,
            scope,
            selected.public_id,
          );
          const values = ledgerValuesSchema.parse({
            name: source.name,
            active: true,
            ledgerGroupId: ledgerGroupId.public_id,
            sortOrder: source.sortOrder,
          });
          const existing = await transaction
            .selectFrom("ledgers")
            .select("id")
            .where("tenant_id", "=", scope.tenantId)
            .where(sql`lower(trim(name))`, "=", values.name.toLowerCase())
            .where("ledger_group_id", "=", ledgerGroupId.id)
            .executeTakeFirst();
          if (existing) return false;
          await transaction
            .insertInto("ledgers")
            .values({
              public_id: generateLedgerPublicId(),
              tenant_id: scope.tenantId,
              name: values.name,
              active: true,
              ledger_group_id: ledgerGroupId.id,
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
          failure.constraint !== "ledgers_public_id_unique" ||
          attempt === 4
        )
          throw error;
      }
    }
  }
  return { policy, inserted, available: referenceData.length };
}
