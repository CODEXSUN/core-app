import { randomInt } from "node:crypto";
import { sql, type Kysely } from "kysely";
import type { Database } from "../../../database/schema.ts";
import type { ModuleContext } from "../../../database/context.ts";
import { ConflictError } from "../../../http.ts";
import type { ProductGroupValues } from "../../../../../contracts/product-group.ts";

const alphabet = "abcdefghijklmnopqrstuvwxyz0123456789";
export function generateProductGroupPublicId() {
  return Array.from(
    { length: 8 },
    () => alphabet[randomInt(alphabet.length)],
  ).join("");
}
function query(db: Kysely<Database>) {
  return db
    .selectFrom("product_groups")

    .select([
      "product_groups.id",
      "product_groups.public_id",
      "product_groups.name",
      "product_groups.active",
      "product_groups.created_at",
      "product_groups.updated_at",
      "product_groups.created_by",
      "product_groups.updated_by",
      "product_groups.sort_order as sortOrder",
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
export async function listProductGroup(
  db: Kysely<Database>,
  context: ModuleContext,
) {
  const rows = await query(db)
    .where("product_groups.tenant_id", "=", context.tenantId)
    .where("product_groups.deleted_at", "is", null)
    .orderBy("product_groups.name")
    .execute();
  return rows.map(publicRecord);
}
export async function findProductGroup(
  db: Kysely<Database>,
  context: ModuleContext,
  publicId: string,
) {
  const row = await query(db)
    .where("product_groups.tenant_id", "=", context.tenantId)
    .where("product_groups.public_id", "=", publicId)
    .where("product_groups.deleted_at", "is", null)
    .executeTakeFirst();
  return row ? publicRecord(row) : undefined;
}
export async function findInternalProductGroup(
  db: Kysely<Database>,
  context: ModuleContext,
  publicId: string,
) {
  const row = await query(db)
    .where("product_groups.tenant_id", "=", context.tenantId)
    .where("product_groups.public_id", "=", publicId)
    .where("product_groups.deleted_at", "is", null)
    .forShare("product_groups")
    .executeTakeFirst();
  return row ? { ...publicRecord(row), id: row.id } : undefined;
}
async function editable(
  db: Kysely<Database>,
  context: ModuleContext,
  values: ProductGroupValues,
) {
  return {
    name: values.name,
    active: values.active,
    sort_order: values.sortOrder,
  };
}
export async function insertProductGroup(
  db: Kysely<Database>,
  context: ModuleContext,
  values: ProductGroupValues,
  generate = generateProductGroupPublicId,
) {
  for (let attempt = 0; attempt < 5; attempt++) {
    try {
      const publicId = generate();
      await db.transaction().execute(async (transaction) => {
        const data = await editable(transaction, context, values);
        await transaction
          .insertInto("product_groups")
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
      const saved = await findProductGroup(db, context, publicId);
      if (!saved) throw new Error("Saved record could not be read.");
      return saved;
    } catch (error) {
      const failure = error as { code?: string; constraint?: string };
      if (
        failure.code !== "23505" ||
        failure.constraint !== "product_groups_public_id_unique"
      )
        throw error;
      if (attempt === 4) throw new Error("Unable to allocate a public ID.");
    }
  }
  throw new Error("Unable to allocate a public ID.");
}
export async function updateProductGroup(
  db: Kysely<Database>,
  context: ModuleContext,
  publicId: string,
  values: ProductGroupValues,
) {
  const changed = await db.transaction().execute(async (transaction) => {
    const existing = await transaction
      .selectFrom("product_groups")
      .selectAll()
      .where("tenant_id", "=", context.tenantId)
      .where("public_id", "=", publicId)
      .where("deleted_at", "is", null)
      .forUpdate()
      .executeTakeFirst();
    if (!existing) return false;
    const data = await editable(transaction, context, values);
    await transaction
      .updateTable("product_groups")
      .set({ ...data, updated_at: new Date(), updated_by: context.actorId })
      .where("id", "=", existing.id)
      .where("tenant_id", "=", context.tenantId)
      .execute();
    return true;
  });
  return changed ? findProductGroup(db, context, publicId) : undefined;
}
