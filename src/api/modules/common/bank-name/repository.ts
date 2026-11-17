import { randomInt } from "node:crypto";
import { sql, type Kysely } from "kysely";
import type { Database } from "../../../database/schema.ts";
import type { ModuleContext } from "../../../database/context.ts";
import { ConflictError } from "../../../http.ts";
import type { BankNameValues } from "../../../../../contracts/bank-name.ts";

const alphabet = "abcdefghijklmnopqrstuvwxyz0123456789";
export function generateBankNamePublicId() {
  return Array.from(
    { length: 8 },
    () => alphabet[randomInt(alphabet.length)],
  ).join("");
}
function query(db: Kysely<Database>) {
  return db
    .selectFrom("bank_names")

    .select([
      "bank_names.id",
      "bank_names.public_id",
      "bank_names.name",
      "bank_names.active",
      "bank_names.created_at",
      "bank_names.updated_at",
      "bank_names.created_by",
      "bank_names.updated_by",
      "bank_names.sort_order as sortOrder",
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
export async function listBankName(
  db: Kysely<Database>,
  context: ModuleContext,
) {
  const rows = await query(db)
    .where("bank_names.tenant_id", "=", context.tenantId)
    .where("bank_names.deleted_at", "is", null)
    .orderBy("bank_names.name")
    .execute();
  return rows.map(publicRecord);
}
export async function findBankName(
  db: Kysely<Database>,
  context: ModuleContext,
  publicId: string,
) {
  const row = await query(db)
    .where("bank_names.tenant_id", "=", context.tenantId)
    .where("bank_names.public_id", "=", publicId)
    .where("bank_names.deleted_at", "is", null)
    .executeTakeFirst();
  return row ? publicRecord(row) : undefined;
}
export async function findInternalBankName(
  db: Kysely<Database>,
  context: ModuleContext,
  publicId: string,
) {
  const row = await query(db)
    .where("bank_names.tenant_id", "=", context.tenantId)
    .where("bank_names.public_id", "=", publicId)
    .where("bank_names.deleted_at", "is", null)
    .forShare("bank_names")
    .executeTakeFirst();
  return row ? { ...publicRecord(row), id: row.id } : undefined;
}
async function editable(
  db: Kysely<Database>,
  context: ModuleContext,
  values: BankNameValues,
) {
  return {
    name: values.name,
    active: values.active,
    sort_order: values.sortOrder,
  };
}
export async function insertBankName(
  db: Kysely<Database>,
  context: ModuleContext,
  values: BankNameValues,
  generate = generateBankNamePublicId,
) {
  for (let attempt = 0; attempt < 5; attempt++) {
    try {
      const publicId = generate();
      await db.transaction().execute(async (transaction) => {
        const data = await editable(transaction, context, values);
        await transaction
          .insertInto("bank_names")
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
      const saved = await findBankName(db, context, publicId);
      if (!saved) throw new Error("Saved record could not be read.");
      return saved;
    } catch (error) {
      const failure = error as { code?: string; constraint?: string };
      if (
        failure.code !== "23505" ||
        failure.constraint !== "bank_names_public_id_unique"
      )
        throw error;
      if (attempt === 4) throw new Error("Unable to allocate a public ID.");
    }
  }
  throw new Error("Unable to allocate a public ID.");
}
export async function updateBankName(
  db: Kysely<Database>,
  context: ModuleContext,
  publicId: string,
  values: BankNameValues,
) {
  const changed = await db.transaction().execute(async (transaction) => {
    const existing = await transaction
      .selectFrom("bank_names")
      .selectAll()
      .where("tenant_id", "=", context.tenantId)
      .where("public_id", "=", publicId)
      .where("deleted_at", "is", null)
      .forUpdate()
      .executeTakeFirst();
    if (!existing) return false;
    const data = await editable(transaction, context, values);
    await transaction
      .updateTable("bank_names")
      .set({ ...data, updated_at: new Date(), updated_by: context.actorId })
      .where("id", "=", existing.id)
      .where("tenant_id", "=", context.tenantId)
      .execute();
    return true;
  });
  return changed ? findBankName(db, context, publicId) : undefined;
}
