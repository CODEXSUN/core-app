import { randomInt } from "node:crypto";
import { sql, type Kysely } from "kysely";
import type { Database } from "../../../database/schema.ts";
import type { ModuleContext } from "../../../database/context.ts";
import { ConflictError } from "../../../http.ts";
import type { ProductTypeValues } from "../../../../../contracts/product-type.ts";

const alphabet = "abcdefghijklmnopqrstuvwxyz0123456789";
export function generateProductTypePublicId() {
  return Array.from(
    { length: 8 },
    () => alphabet[randomInt(alphabet.length)],
  ).join("");
}
function query(db: Kysely<Database>) {
  return db
    .selectFrom("product_types")

    .select([
      "product_types.id",
      "product_types.public_id",
      "product_types.name",
      "product_types.active",
      "product_types.created_at",
      "product_types.updated_at",
      "product_types.created_by",
      "product_types.updated_by",
      "product_types.sort_order as sortOrder",
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
export async function listProductType(
  db: Kysely<Database>,
  context: ModuleContext,
) {
  const rows = await query(db)
    .where("product_types.tenant_id", "=", context.tenantId)
    .where("product_types.deleted_at", "is", null)
    .orderBy("product_types.name")
    .execute();
  return rows.map(publicRecord);
}
export async function findProductType(
  db: Kysely<Database>,
  context: ModuleContext,
  publicId: string,
) {
  const row = await query(db)
    .where("product_types.tenant_id", "=", context.tenantId)
    .where("product_types.public_id", "=", publicId)
    .where("product_types.deleted_at", "is", null)
    .executeTakeFirst();
  return row ? publicRecord(row) : undefined;
}
export async function findInternalProductType(
  db: Kysely<Database>,
  context: ModuleContext,
  publicId: string,
) {
  const row = await query(db)
    .where("product_types.tenant_id", "=", context.tenantId)
    .where("product_types.public_id", "=", publicId)
    .where("product_types.deleted_at", "is", null)
    .forShare("product_types")
    .executeTakeFirst();
  return row ? { ...publicRecord(row), id: row.id } : undefined;
}
async function editable(
  db: Kysely<Database>,
  context: ModuleContext,
  values: ProductTypeValues,
) {
  return {
    name: values.name,
    active: values.active,
    sort_order: values.sortOrder,
  };
}
export async function insertProductType(
  db: Kysely<Database>,
  context: ModuleContext,
  values: ProductTypeValues,
  generate = generateProductTypePublicId,
) {
  for (let attempt = 0; attempt < 5; attempt++) {
    try {
      const publicId = generate();
      await db.transaction().execute(async (transaction) => {
        const data = await editable(transaction, context, values);
        await transaction
          .insertInto("product_types")
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
      const saved = await findProductType(db, context, publicId);
      if (!saved) throw new Error("Saved record could not be read.");
      return saved;
    } catch (error) {
      const failure = error as { code?: string; constraint?: string };
      if (
        failure.code !== "23505" ||
        failure.constraint !== "product_types_public_id_unique"
      )
        throw error;
      if (attempt === 4) throw new Error("Unable to allocate a public ID.");
    }
  }
  throw new Error("Unable to allocate a public ID.");
}
export async function updateProductType(
  db: Kysely<Database>,
  context: ModuleContext,
  publicId: string,
  values: ProductTypeValues,
) {
  const changed = await db.transaction().execute(async (transaction) => {
    const existing = await transaction
      .selectFrom("product_types")
      .selectAll()
      .where("tenant_id", "=", context.tenantId)
      .where("public_id", "=", publicId)
      .where("deleted_at", "is", null)
      .forUpdate()
      .executeTakeFirst();
    if (!existing) return false;
    const data = await editable(transaction, context, values);
    await transaction
      .updateTable("product_types")
      .set({ ...data, updated_at: new Date(), updated_by: context.actorId })
      .where("id", "=", existing.id)
      .where("tenant_id", "=", context.tenantId)
      .execute();
    return true;
  });
  return changed ? findProductType(db, context, publicId) : undefined;
}
