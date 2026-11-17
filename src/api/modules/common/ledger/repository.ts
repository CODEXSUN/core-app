import { randomInt } from "node:crypto";
import { sql, type Kysely } from "kysely";
import type { Database } from "../../../database/schema.ts";
import type { ModuleContext } from "../../../database/context.ts";
import { ConflictError } from "../../../http.ts";
import type { LedgerValues } from "../../../../../contracts/ledger.ts";
import { resolveLedgerGroupReference } from "../../common/ledger-group/index.ts";

const alphabet = "abcdefghijklmnopqrstuvwxyz0123456789";
export function generateLedgerPublicId() {
  return Array.from(
    { length: 8 },
    () => alphabet[randomInt(alphabet.length)],
  ).join("");
}
function query(db: Kysely<Database>) {
  return db
    .selectFrom("ledgers")
    .leftJoin("ledger_groups as ledgerGroupIdRef", (join) =>
      join
        .onRef("ledgerGroupIdRef.id", "=", "ledgers.ledger_group_id")
        .onRef("ledgerGroupIdRef.tenant_id", "=", "ledgers.tenant_id"),
    )
    .select([
      "ledgers.id",
      "ledgers.public_id",
      "ledgers.name",
      "ledgers.active",
      "ledgers.created_at",
      "ledgers.updated_at",
      "ledgers.created_by",
      "ledgers.updated_by",
      "ledgers.sort_order as sortOrder",
      "ledgerGroupIdRef.public_id as ledgerGroupId",
      "ledgerGroupIdRef.name as ledgerGroupName",
    ] as const);
}
type Row = NonNullable<
  Awaited<ReturnType<ReturnType<typeof query>["executeTakeFirst"]>>
>;
function publicRecord(row: Row) {
  const { id, ...rest } = row;
  return {
    ...rest,
    ledgerGroupId: row.ledgerGroupId ?? "",
    ledgerGroupName: row.ledgerGroupName ?? "",
    created_at: row.created_at.toISOString(),
    updated_at: row.updated_at.toISOString(),
  };
}
export async function listLedger(db: Kysely<Database>, context: ModuleContext) {
  const rows = await query(db)
    .where("ledgers.tenant_id", "=", context.tenantId)
    .where("ledgers.deleted_at", "is", null)
    .orderBy("ledgers.name")
    .execute();
  return rows.map(publicRecord);
}
export async function findLedger(
  db: Kysely<Database>,
  context: ModuleContext,
  publicId: string,
) {
  const row = await query(db)
    .where("ledgers.tenant_id", "=", context.tenantId)
    .where("ledgers.public_id", "=", publicId)
    .where("ledgers.deleted_at", "is", null)
    .executeTakeFirst();
  return row ? publicRecord(row) : undefined;
}
export async function findInternalLedger(
  db: Kysely<Database>,
  context: ModuleContext,
  publicId: string,
) {
  const row = await query(db)
    .where("ledgers.tenant_id", "=", context.tenantId)
    .where("ledgers.public_id", "=", publicId)
    .where("ledgers.deleted_at", "is", null)
    .forShare("ledgers")
    .executeTakeFirst();
  return row ? { ...publicRecord(row), id: row.id } : undefined;
}
async function editable(
  db: Kysely<Database>,
  context: ModuleContext,
  values: LedgerValues,
) {
  const ledgerGroupId = await resolveLedgerGroupReference(
    db,
    context,
    values.ledgerGroupId,
  );

  return {
    name: values.name,
    active: values.active,
    ledger_group_id: ledgerGroupId?.id ?? null,
    sort_order: values.sortOrder,
  };
}
export async function insertLedger(
  db: Kysely<Database>,
  context: ModuleContext,
  values: LedgerValues,
  generate = generateLedgerPublicId,
) {
  for (let attempt = 0; attempt < 5; attempt++) {
    try {
      const publicId = generate();
      await db.transaction().execute(async (transaction) => {
        const data = await editable(transaction, context, values);
        await transaction
          .insertInto("ledgers")
          .values({
            ...data,
            public_id: publicId,
            tenant_id: context.tenantId,
            created_by: context.actorId,
            updated_by: context.actorId,
            deleted_at: null,
            deleted_by: null,
          })
          .execute();
      });
      const saved = await findLedger(db, context, publicId);
      if (!saved) throw new Error("Saved record could not be read.");
      return saved;
    } catch (error) {
      const failure = error as { code?: string; constraint?: string };
      if (
        failure.code !== "23505" ||
        failure.constraint !== "ledgers_public_id_unique"
      )
        throw error;
      if (attempt === 4) throw new Error("Unable to allocate a public ID.");
    }
  }
  throw new Error("Unable to allocate a public ID.");
}
export async function updateLedger(
  db: Kysely<Database>,
  context: ModuleContext,
  publicId: string,
  values: LedgerValues,
) {
  const changed = await db.transaction().execute(async (transaction) => {
    const existing = await transaction
      .selectFrom("ledgers")
      .selectAll()
      .where("tenant_id", "=", context.tenantId)
      .where("public_id", "=", publicId)
      .where("deleted_at", "is", null)
      .forUpdate()
      .executeTakeFirst();
    if (!existing) return false;
    const data = await editable(transaction, context, values);
    await transaction
      .updateTable("ledgers")
      .set({ ...data, updated_at: new Date(), updated_by: context.actorId })
      .where("id", "=", existing.id)
      .where("tenant_id", "=", context.tenantId)
      .execute();
    return true;
  });
  return changed ? findLedger(db, context, publicId) : undefined;
}
