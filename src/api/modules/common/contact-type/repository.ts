import { randomInt } from "node:crypto";
import { sql, type Kysely } from "kysely";
import type { Database } from "../../../database/schema.ts";
import type { ModuleContext } from "../../../database/context.ts";
import { ConflictError } from "../../../http.ts";
import type { ContactTypeValues } from "../../../../../contracts/contact-type.ts";

const alphabet = "abcdefghijklmnopqrstuvwxyz0123456789";
export function generateContactTypePublicId() {
  return Array.from(
    { length: 8 },
    () => alphabet[randomInt(alphabet.length)],
  ).join("");
}
function query(db: Kysely<Database>) {
  return db
    .selectFrom("contact_types")

    .select([
      "contact_types.id",
      "contact_types.public_id",
      "contact_types.name",
      "contact_types.active",
      "contact_types.created_at",
      "contact_types.updated_at",
      "contact_types.created_by",
      "contact_types.updated_by",
      "contact_types.sort_order as sortOrder",
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
export async function listContactType(
  db: Kysely<Database>,
  context: ModuleContext,
) {
  const rows = await query(db)
    .where("contact_types.tenant_id", "=", context.tenantId)
    .where("contact_types.deleted_at", "is", null)
    .orderBy("contact_types.name")
    .execute();
  return rows.map(publicRecord);
}
export async function findContactType(
  db: Kysely<Database>,
  context: ModuleContext,
  publicId: string,
) {
  const row = await query(db)
    .where("contact_types.tenant_id", "=", context.tenantId)
    .where("contact_types.public_id", "=", publicId)
    .where("contact_types.deleted_at", "is", null)
    .executeTakeFirst();
  return row ? publicRecord(row) : undefined;
}
export async function findInternalContactType(
  db: Kysely<Database>,
  context: ModuleContext,
  publicId: string,
) {
  const row = await query(db)
    .where("contact_types.tenant_id", "=", context.tenantId)
    .where("contact_types.public_id", "=", publicId)
    .where("contact_types.deleted_at", "is", null)
    .forShare("contact_types")
    .executeTakeFirst();
  return row ? { ...publicRecord(row), id: row.id } : undefined;
}
async function editable(
  db: Kysely<Database>,
  context: ModuleContext,
  values: ContactTypeValues,
) {
  return {
    name: values.name,
    active: values.active,
    sort_order: values.sortOrder,
  };
}
export async function insertContactType(
  db: Kysely<Database>,
  context: ModuleContext,
  values: ContactTypeValues,
  generate = generateContactTypePublicId,
) {
  for (let attempt = 0; attempt < 5; attempt++) {
    try {
      const publicId = generate();
      await db.transaction().execute(async (transaction) => {
        const data = await editable(transaction, context, values);
        await transaction
          .insertInto("contact_types")
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
      const saved = await findContactType(db, context, publicId);
      if (!saved) throw new Error("Saved record could not be read.");
      return saved;
    } catch (error) {
      const failure = error as { code?: string; constraint?: string };
      if (
        failure.code !== "23505" ||
        failure.constraint !== "contact_types_public_id_unique"
      )
        throw error;
      if (attempt === 4) throw new Error("Unable to allocate a public ID.");
    }
  }
  throw new Error("Unable to allocate a public ID.");
}
export async function updateContactType(
  db: Kysely<Database>,
  context: ModuleContext,
  publicId: string,
  values: ContactTypeValues,
) {
  const changed = await db.transaction().execute(async (transaction) => {
    const existing = await transaction
      .selectFrom("contact_types")
      .selectAll()
      .where("tenant_id", "=", context.tenantId)
      .where("public_id", "=", publicId)
      .where("deleted_at", "is", null)
      .forUpdate()
      .executeTakeFirst();
    if (!existing) return false;
    const data = await editable(transaction, context, values);
    await transaction
      .updateTable("contact_types")
      .set({ ...data, updated_at: new Date(), updated_by: context.actorId })
      .where("id", "=", existing.id)
      .where("tenant_id", "=", context.tenantId)
      .execute();
    return true;
  });
  return changed ? findContactType(db, context, publicId) : undefined;
}
