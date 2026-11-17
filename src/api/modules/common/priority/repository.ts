import { randomInt } from "node:crypto";
import { sql, type Kysely } from "kysely";
import type { Database } from "../../../database/schema.ts";
import type { ModuleContext } from "../../../database/context.ts";
import { ConflictError } from "../../../http.ts";
import type { PriorityValues } from "../../../../../contracts/priority.ts";

const alphabet = "abcdefghijklmnopqrstuvwxyz0123456789";
export function generatePriorityPublicId() {
  return Array.from(
    { length: 8 },
    () => alphabet[randomInt(alphabet.length)],
  ).join("");
}
function query(db: Kysely<Database>) {
  return db
    .selectFrom("priorities")

    .select([
      "priorities.id",
      "priorities.public_id",
      "priorities.name",
      "priorities.active",
      "priorities.created_at",
      "priorities.updated_at",
      "priorities.created_by",
      "priorities.updated_by",
      "priorities.colour",
      "priorities.tag",
      "priorities.sort_order as sortOrder",
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
export async function listPriority(
  db: Kysely<Database>,
  context: ModuleContext,
) {
  const rows = await query(db)
    .where("priorities.tenant_id", "=", context.tenantId)
    .where("priorities.deleted_at", "is", null)
    .orderBy("priorities.name")
    .execute();
  return rows.map(publicRecord);
}
export async function findPriority(
  db: Kysely<Database>,
  context: ModuleContext,
  publicId: string,
) {
  const row = await query(db)
    .where("priorities.tenant_id", "=", context.tenantId)
    .where("priorities.public_id", "=", publicId)
    .where("priorities.deleted_at", "is", null)
    .executeTakeFirst();
  return row ? publicRecord(row) : undefined;
}
export async function findInternalPriority(
  db: Kysely<Database>,
  context: ModuleContext,
  publicId: string,
) {
  const row = await query(db)
    .where("priorities.tenant_id", "=", context.tenantId)
    .where("priorities.public_id", "=", publicId)
    .where("priorities.deleted_at", "is", null)
    .forShare("priorities")
    .executeTakeFirst();
  return row ? { ...publicRecord(row), id: row.id } : undefined;
}
async function editable(
  db: Kysely<Database>,
  context: ModuleContext,
  values: PriorityValues,
) {
  return {
    name: values.name,
    active: values.active,
    colour: values.colour,
    tag: values.tag,
    sort_order: values.sortOrder,
  };
}
export async function insertPriority(
  db: Kysely<Database>,
  context: ModuleContext,
  values: PriorityValues,
  generate = generatePriorityPublicId,
) {
  for (let attempt = 0; attempt < 5; attempt++) {
    try {
      const publicId = generate();
      await db.transaction().execute(async (transaction) => {
        const data = await editable(transaction, context, values);
        await transaction
          .insertInto("priorities")
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
      const saved = await findPriority(db, context, publicId);
      if (!saved) throw new Error("Saved record could not be read.");
      return saved;
    } catch (error) {
      const failure = error as { code?: string; constraint?: string };
      if (
        failure.code !== "23505" ||
        failure.constraint !== "priorities_public_id_unique"
      )
        throw error;
      if (attempt === 4) throw new Error("Unable to allocate a public ID.");
    }
  }
  throw new Error("Unable to allocate a public ID.");
}
export async function updatePriority(
  db: Kysely<Database>,
  context: ModuleContext,
  publicId: string,
  values: PriorityValues,
) {
  const changed = await db.transaction().execute(async (transaction) => {
    const existing = await transaction
      .selectFrom("priorities")
      .selectAll()
      .where("tenant_id", "=", context.tenantId)
      .where("public_id", "=", publicId)
      .where("deleted_at", "is", null)
      .forUpdate()
      .executeTakeFirst();
    if (!existing) return false;
    const data = await editable(transaction, context, values);
    await transaction
      .updateTable("priorities")
      .set({ ...data, updated_at: new Date(), updated_by: context.actorId })
      .where("id", "=", existing.id)
      .where("tenant_id", "=", context.tenantId)
      .execute();
    return true;
  });
  return changed ? findPriority(db, context, publicId) : undefined;
}
