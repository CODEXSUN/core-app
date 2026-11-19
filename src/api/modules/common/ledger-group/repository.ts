import {pageModuleRecords} from '../../../database/page.ts';
import { randomInt } from "node:crypto";
import { sql, type Kysely } from "kysely";
import type { Database } from "../../../database/schema.ts";
import type { ModuleContext } from "../../../database/context.ts";
import { ConflictError } from "../../../http.ts";
import type { LedgerGroupValues } from "../../../../../contracts/ledger-group.ts";

const alphabet = "abcdefghijklmnopqrstuvwxyz0123456789";
export function generateLedgerGroupPublicId() {
  return Array.from(
    { length: 8 },
    () => alphabet[randomInt(alphabet.length)],
  ).join("");
}
function query(db: Kysely<Database>) {
  return db
    .selectFrom("ledger_groups")

    .select([
      "ledger_groups.id",
      "ledger_groups.public_id",
      "ledger_groups.name",
      "ledger_groups.active",
      "ledger_groups.created_at",
      "ledger_groups.updated_at",
      "ledger_groups.created_by",
      "ledger_groups.updated_by",
      "ledger_groups.sort_order as sortOrder",
    ] as const);
}
type Row = NonNullable<
  Awaited<ReturnType<ReturnType<typeof query>["executeTakeFirst"]>>
>;
function publicRecord(row: Row) {
  const { id, ...rest } = row;
  return {
    ...rest,

    created_at: row.created_at.toISOString(),
    updated_at: row.updated_at.toISOString(),
  };
}
export async function listLedgerGroup(
  db: Kysely<Database>,
  context: ModuleContext,
) {
  const rows = await query(db)
    .where("ledger_groups.tenant_id", "=", context.tenantId)
    .where("ledger_groups.deleted_at", "is", null)
    .orderBy("ledger_groups.name")
    .execute();
  return rows.map(publicRecord);
}
export async function findLedgerGroup(
  db: Kysely<Database>,
  context: ModuleContext,
  publicId: string,
) {
  const row = await query(db)
    .where("ledger_groups.tenant_id", "=", context.tenantId)
    .where("ledger_groups.public_id", "=", publicId)
    .where("ledger_groups.deleted_at", "is", null)
    .executeTakeFirst();
  return row ? publicRecord(row) : undefined;
}
export async function findInternalLedgerGroup(
  db: Kysely<Database>,
  context: ModuleContext,
  publicId: string,
) {
  const row = await query(db)
    .where("ledger_groups.tenant_id", "=", context.tenantId)
    .where("ledger_groups.public_id", "=", publicId)
    .where("ledger_groups.deleted_at", "is", null)
    .forShare("ledger_groups")
    .executeTakeFirst();
  return row ? { ...publicRecord(row), id: row.id } : undefined;
}
async function editable(
  db: Kysely<Database>,
  context: ModuleContext,
  values: LedgerGroupValues,
) {
  return {
    name: values.name,
    active: values.active,
    sort_order: values.sortOrder,
  };
}
export async function insertLedgerGroup(
  db: Kysely<Database>,
  context: ModuleContext,
  values: LedgerGroupValues,
  generate = generateLedgerGroupPublicId,
) {
  for (let attempt = 0; attempt < 5; attempt++) {
    try {
      const publicId = generate();
      await db.transaction().execute(async (transaction) => {
        const data = await editable(transaction, context, values);
        await transaction
          .insertInto("ledger_groups")
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
      const saved = await findLedgerGroup(db, context, publicId);
      if (!saved) throw new Error("Saved record could not be read.");
      return saved;
    } catch (error) {
      const failure = error as { code?: string; constraint?: string };
      if (
        failure.code !== "23505" ||
        failure.constraint !== "ledger_groups_public_id_unique"
      )
        throw error;
      if (attempt === 4) throw new Error("Unable to allocate a public ID.");
    }
  }
  throw new Error("Unable to allocate a public ID.");
}
export async function updateLedgerGroup(
  db: Kysely<Database>,
  context: ModuleContext,
  publicId: string,
  values: LedgerGroupValues,
) {
  const changed = await db.transaction().execute(async (transaction) => {
    const existing = await transaction
      .selectFrom("ledger_groups")
      .selectAll()
      .where("tenant_id", "=", context.tenantId)
      .where("public_id", "=", publicId)
      .where("deleted_at", "is", null)
      .forUpdate()
      .executeTakeFirst();
    if (!existing) return false;
    const data = await editable(transaction, context, values);
    await transaction
      .updateTable("ledger_groups")
      .set({ ...data, updated_at: new Date(), updated_by: context.actorId })
      .where("id", "=", existing.id)
      .where("tenant_id", "=", context.tenantId)
      .execute();
    return true;
  });
  return changed ? findLedgerGroup(db, context, publicId) : undefined;
}

export async function pageLedgerGroupRecords(db:Kysely<Database>,context:ModuleContext,input:unknown){
 const result=await pageModuleRecords(db,query(db).where('ledger_groups.tenant_id','=',context.tenantId).where('ledger_groups.deleted_at','is',null),input,{"name":{"field":"name"},"sortOrder":{"field":"sortOrder"},"active":{"field":"active","boolean":true}});
 return result;
}
