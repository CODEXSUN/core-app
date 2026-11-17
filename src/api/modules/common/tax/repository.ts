import { randomInt } from "node:crypto";
import { sql, type Kysely } from "kysely";
import type { Database } from "../../../database/schema.ts";
import type { ModuleContext } from "../../../database/context.ts";
import { ConflictError } from "../../../http.ts";
import type { TaxValues } from "../../../../../contracts/tax.ts";

const alphabet = "abcdefghijklmnopqrstuvwxyz0123456789";
export function generateTaxPublicId() {
  return Array.from(
    { length: 8 },
    () => alphabet[randomInt(alphabet.length)],
  ).join("");
}
function query(db: Kysely<Database>) {
  return db
    .selectFrom("taxes")

    .select([
      "taxes.id",
      "taxes.public_id",
      "taxes.name",
      "taxes.active",
      "taxes.created_at",
      "taxes.updated_at",
      "taxes.created_by",
      "taxes.updated_by",
      "taxes.rate_percent as ratePercent",
      "taxes.description",
      "taxes.sort_order as sortOrder",
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
export async function listTax(db: Kysely<Database>, context: ModuleContext) {
  const rows = await query(db)
    .where("taxes.tenant_id", "=", context.tenantId)
    .where("taxes.deleted_at", "is", null)
    .orderBy("taxes.name")
    .execute();
  return rows.map(publicRecord);
}
export async function findTax(
  db: Kysely<Database>,
  context: ModuleContext,
  publicId: string,
) {
  const row = await query(db)
    .where("taxes.tenant_id", "=", context.tenantId)
    .where("taxes.public_id", "=", publicId)
    .where("taxes.deleted_at", "is", null)
    .executeTakeFirst();
  return row ? publicRecord(row) : undefined;
}
export async function findInternalTax(
  db: Kysely<Database>,
  context: ModuleContext,
  publicId: string,
) {
  const row = await query(db)
    .where("taxes.tenant_id", "=", context.tenantId)
    .where("taxes.public_id", "=", publicId)
    .where("taxes.deleted_at", "is", null)
    .forShare("taxes")
    .executeTakeFirst();
  return row ? { ...publicRecord(row), id: row.id } : undefined;
}
async function editable(
  db: Kysely<Database>,
  context: ModuleContext,
  values: TaxValues,
) {
  return {
    name: values.name,
    active: values.active,
    rate_percent: values.ratePercent,
    description: values.description,
    sort_order: values.sortOrder,
  };
}
export async function insertTax(
  db: Kysely<Database>,
  context: ModuleContext,
  values: TaxValues,
  generate = generateTaxPublicId,
) {
  for (let attempt = 0; attempt < 5; attempt++) {
    try {
      const publicId = generate();
      await db.transaction().execute(async (transaction) => {
        const data = await editable(transaction, context, values);
        await transaction
          .insertInto("taxes")
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
      const saved = await findTax(db, context, publicId);
      if (!saved) throw new Error("Saved record could not be read.");
      return saved;
    } catch (error) {
      const failure = error as { code?: string; constraint?: string };
      if (
        failure.code !== "23505" ||
        failure.constraint !== "taxes_public_id_unique"
      )
        throw error;
      if (attempt === 4) throw new Error("Unable to allocate a public ID.");
    }
  }
  throw new Error("Unable to allocate a public ID.");
}
export async function updateTax(
  db: Kysely<Database>,
  context: ModuleContext,
  publicId: string,
  values: TaxValues,
) {
  const changed = await db.transaction().execute(async (transaction) => {
    const existing = await transaction
      .selectFrom("taxes")
      .selectAll()
      .where("tenant_id", "=", context.tenantId)
      .where("public_id", "=", publicId)
      .where("deleted_at", "is", null)
      .forUpdate()
      .executeTakeFirst();
    if (!existing) return false;
    const data = await editable(transaction, context, values);
    await transaction
      .updateTable("taxes")
      .set({ ...data, updated_at: new Date(), updated_by: context.actorId })
      .where("id", "=", existing.id)
      .where("tenant_id", "=", context.tenantId)
      .execute();
    return true;
  });
  return changed ? findTax(db, context, publicId) : undefined;
}
