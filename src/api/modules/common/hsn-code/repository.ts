import { randomInt } from "node:crypto";
import { sql, type Kysely } from "kysely";
import type { Database } from "../../../database/schema.ts";
import type { ModuleContext } from "../../../database/context.ts";
import { ConflictError } from "../../../http.ts";
import type { HsnCodeValues } from "../../../../../contracts/hsn-code.ts";

const alphabet = "abcdefghijklmnopqrstuvwxyz0123456789";
export function generateHsnCodePublicId() {
  return Array.from(
    { length: 8 },
    () => alphabet[randomInt(alphabet.length)],
  ).join("");
}
function query(db: Kysely<Database>) {
  return db
    .selectFrom("hsn_codes")

    .select([
      "hsn_codes.id",
      "hsn_codes.public_id",
      "hsn_codes.name",
      "hsn_codes.active",
      "hsn_codes.created_at",
      "hsn_codes.updated_at",
      "hsn_codes.created_by",
      "hsn_codes.updated_by",
      "hsn_codes.code",
      "hsn_codes.description",
      "hsn_codes.sort_order as sortOrder",
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
export async function listHsnCode(
  db: Kysely<Database>,
  context: ModuleContext,
) {
  const rows = await query(db)
    .where("hsn_codes.tenant_id", "=", context.tenantId)
    .where("hsn_codes.deleted_at", "is", null)
    .orderBy("hsn_codes.name")
    .execute();
  return rows.map(publicRecord);
}
export async function findHsnCode(
  db: Kysely<Database>,
  context: ModuleContext,
  publicId: string,
) {
  const row = await query(db)
    .where("hsn_codes.tenant_id", "=", context.tenantId)
    .where("hsn_codes.public_id", "=", publicId)
    .where("hsn_codes.deleted_at", "is", null)
    .executeTakeFirst();
  return row ? publicRecord(row) : undefined;
}
export async function findInternalHsnCode(
  db: Kysely<Database>,
  context: ModuleContext,
  publicId: string,
) {
  const row = await query(db)
    .where("hsn_codes.tenant_id", "=", context.tenantId)
    .where("hsn_codes.public_id", "=", publicId)
    .where("hsn_codes.deleted_at", "is", null)
    .forShare("hsn_codes")
    .executeTakeFirst();
  return row ? { ...publicRecord(row), id: row.id } : undefined;
}
async function editable(
  db: Kysely<Database>,
  context: ModuleContext,
  values: HsnCodeValues,
) {
  return {
    name: values.name,
    active: values.active,
    code: values.code,
    description: values.description,
    sort_order: values.sortOrder,
  };
}
export async function insertHsnCode(
  db: Kysely<Database>,
  context: ModuleContext,
  values: HsnCodeValues,
  generate = generateHsnCodePublicId,
) {
  for (let attempt = 0; attempt < 5; attempt++) {
    try {
      const publicId = generate();
      await db.transaction().execute(async (transaction) => {
        const data = await editable(transaction, context, values);
        await transaction
          .insertInto("hsn_codes")
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
      const saved = await findHsnCode(db, context, publicId);
      if (!saved) throw new Error("Saved record could not be read.");
      return saved;
    } catch (error) {
      const failure = error as { code?: string; constraint?: string };
      if (
        failure.code !== "23505" ||
        failure.constraint !== "hsn_codes_public_id_unique"
      )
        throw error;
      if (attempt === 4) throw new Error("Unable to allocate a public ID.");
    }
  }
  throw new Error("Unable to allocate a public ID.");
}
export async function updateHsnCode(
  db: Kysely<Database>,
  context: ModuleContext,
  publicId: string,
  values: HsnCodeValues,
) {
  const changed = await db.transaction().execute(async (transaction) => {
    const existing = await transaction
      .selectFrom("hsn_codes")
      .selectAll()
      .where("tenant_id", "=", context.tenantId)
      .where("public_id", "=", publicId)
      .where("deleted_at", "is", null)
      .forUpdate()
      .executeTakeFirst();
    if (!existing) return false;
    const data = await editable(transaction, context, values);
    await transaction
      .updateTable("hsn_codes")
      .set({ ...data, updated_at: new Date(), updated_by: context.actorId })
      .where("id", "=", existing.id)
      .where("tenant_id", "=", context.tenantId)
      .execute();
    return true;
  });
  return changed ? findHsnCode(db, context, publicId) : undefined;
}
