import { randomInt } from "node:crypto";
import { sql, type Kysely } from "kysely";
import type { Database } from "../../../database/schema.ts";
import type { ModuleContext } from "../../../database/context.ts";
import { ConflictError } from "../../../http.ts";
import type { PaymentTermValues } from "../../../../../contracts/payment-term.ts";

const alphabet = "abcdefghijklmnopqrstuvwxyz0123456789";
export function generatePaymentTermPublicId() {
  return Array.from(
    { length: 8 },
    () => alphabet[randomInt(alphabet.length)],
  ).join("");
}
function query(db: Kysely<Database>) {
  return db
    .selectFrom("payment_terms")

    .select([
      "payment_terms.id",
      "payment_terms.public_id",
      "payment_terms.name",
      "payment_terms.active",
      "payment_terms.created_at",
      "payment_terms.updated_at",
      "payment_terms.created_by",
      "payment_terms.updated_by",
      "payment_terms.sort_order as sortOrder",
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
export async function listPaymentTerm(
  db: Kysely<Database>,
  context: ModuleContext,
) {
  const rows = await query(db)
    .where("payment_terms.tenant_id", "=", context.tenantId)
    .where("payment_terms.deleted_at", "is", null)
    .orderBy("payment_terms.name")
    .execute();
  return rows.map(publicRecord);
}
export async function findPaymentTerm(
  db: Kysely<Database>,
  context: ModuleContext,
  publicId: string,
) {
  const row = await query(db)
    .where("payment_terms.tenant_id", "=", context.tenantId)
    .where("payment_terms.public_id", "=", publicId)
    .where("payment_terms.deleted_at", "is", null)
    .executeTakeFirst();
  return row ? publicRecord(row) : undefined;
}
export async function findInternalPaymentTerm(
  db: Kysely<Database>,
  context: ModuleContext,
  publicId: string,
) {
  const row = await query(db)
    .where("payment_terms.tenant_id", "=", context.tenantId)
    .where("payment_terms.public_id", "=", publicId)
    .where("payment_terms.deleted_at", "is", null)
    .forShare("payment_terms")
    .executeTakeFirst();
  return row ? { ...publicRecord(row), id: row.id } : undefined;
}
async function editable(
  db: Kysely<Database>,
  context: ModuleContext,
  values: PaymentTermValues,
) {
  return {
    name: values.name,
    active: values.active,
    sort_order: values.sortOrder,
  };
}
export async function insertPaymentTerm(
  db: Kysely<Database>,
  context: ModuleContext,
  values: PaymentTermValues,
  generate = generatePaymentTermPublicId,
) {
  for (let attempt = 0; attempt < 5; attempt++) {
    try {
      const publicId = generate();
      await db.transaction().execute(async (transaction) => {
        const data = await editable(transaction, context, values);
        await transaction
          .insertInto("payment_terms")
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
      const saved = await findPaymentTerm(db, context, publicId);
      if (!saved) throw new Error("Saved record could not be read.");
      return saved;
    } catch (error) {
      const failure = error as { code?: string; constraint?: string };
      if (
        failure.code !== "23505" ||
        failure.constraint !== "payment_terms_public_id_unique"
      )
        throw error;
      if (attempt === 4) throw new Error("Unable to allocate a public ID.");
    }
  }
  throw new Error("Unable to allocate a public ID.");
}
export async function updatePaymentTerm(
  db: Kysely<Database>,
  context: ModuleContext,
  publicId: string,
  values: PaymentTermValues,
) {
  const changed = await db.transaction().execute(async (transaction) => {
    const existing = await transaction
      .selectFrom("payment_terms")
      .selectAll()
      .where("tenant_id", "=", context.tenantId)
      .where("public_id", "=", publicId)
      .where("deleted_at", "is", null)
      .forUpdate()
      .executeTakeFirst();
    if (!existing) return false;
    const data = await editable(transaction, context, values);
    await transaction
      .updateTable("payment_terms")
      .set({ ...data, updated_at: new Date(), updated_by: context.actorId })
      .where("id", "=", existing.id)
      .where("tenant_id", "=", context.tenantId)
      .execute();
    return true;
  });
  return changed ? findPaymentTerm(db, context, publicId) : undefined;
}
