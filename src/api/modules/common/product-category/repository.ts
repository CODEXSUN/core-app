import {pageModuleRecords} from '../../../database/page.ts';
import { randomInt } from "node:crypto";
import { sql, type Kysely } from "kysely";
import type { Database } from "../../../database/schema.ts";
import type { ModuleContext } from "../../../database/context.ts";
import { ConflictError } from "../../../http.ts";
import type { ProductCategoryValues } from "../../../../../contracts/product-category.ts";

const alphabet = "abcdefghijklmnopqrstuvwxyz0123456789";
export function generateProductCategoryPublicId() {
  return Array.from(
    { length: 8 },
    () => alphabet[randomInt(alphabet.length)],
  ).join("");
}
function query(db: Kysely<Database>) {
  return db
    .selectFrom("product_categories")

    .select([
      "product_categories.id",
      "product_categories.public_id",
      "product_categories.name",
      "product_categories.active",
      "product_categories.created_at",
      "product_categories.updated_at",
      "product_categories.created_by",
      "product_categories.updated_by",
      "product_categories.sort_order as sortOrder",
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
export async function listProductCategory(
  db: Kysely<Database>,
  context: ModuleContext,
) {
  const rows = await query(db)
    .where("product_categories.tenant_id", "=", context.tenantId)
    .where("product_categories.deleted_at", "is", null)
    .orderBy("product_categories.name")
    .execute();
  return rows.map(publicRecord);
}
export async function findProductCategory(
  db: Kysely<Database>,
  context: ModuleContext,
  publicId: string,
) {
  const row = await query(db)
    .where("product_categories.tenant_id", "=", context.tenantId)
    .where("product_categories.public_id", "=", publicId)
    .where("product_categories.deleted_at", "is", null)
    .executeTakeFirst();
  return row ? publicRecord(row) : undefined;
}
export async function findInternalProductCategory(
  db: Kysely<Database>,
  context: ModuleContext,
  publicId: string,
) {
  const row = await query(db)
    .where("product_categories.tenant_id", "=", context.tenantId)
    .where("product_categories.public_id", "=", publicId)
    .where("product_categories.deleted_at", "is", null)
    .forShare("product_categories")
    .executeTakeFirst();
  return row ? { ...publicRecord(row), id: row.id } : undefined;
}
async function editable(
  db: Kysely<Database>,
  context: ModuleContext,
  values: ProductCategoryValues,
) {
  return {
    name: values.name,
    active: values.active,
    sort_order: values.sortOrder,
  };
}
export async function insertProductCategory(
  db: Kysely<Database>,
  context: ModuleContext,
  values: ProductCategoryValues,
  generate = generateProductCategoryPublicId,
) {
  for (let attempt = 0; attempt < 5; attempt++) {
    try {
      const publicId = generate();
      await db.transaction().execute(async (transaction) => {
        const data = await editable(transaction, context, values);
        await transaction
          .insertInto("product_categories")
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
      const saved = await findProductCategory(db, context, publicId);
      if (!saved) throw new Error("Saved record could not be read.");
      return saved;
    } catch (error) {
      const failure = error as { code?: string; constraint?: string };
      if (
        failure.code !== "23505" ||
        failure.constraint !== "product_categories_public_id_unique"
      )
        throw error;
      if (attempt === 4) throw new Error("Unable to allocate a public ID.");
    }
  }
  throw new Error("Unable to allocate a public ID.");
}
export async function updateProductCategory(
  db: Kysely<Database>,
  context: ModuleContext,
  publicId: string,
  values: ProductCategoryValues,
) {
  const changed = await db.transaction().execute(async (transaction) => {
    const existing = await transaction
      .selectFrom("product_categories")
      .selectAll()
      .where("tenant_id", "=", context.tenantId)
      .where("public_id", "=", publicId)
      .where("deleted_at", "is", null)
      .forUpdate()
      .executeTakeFirst();
    if (!existing) return false;
    const data = await editable(transaction, context, values);
    await transaction
      .updateTable("product_categories")
      .set({ ...data, updated_at: new Date(), updated_by: context.actorId })
      .where("id", "=", existing.id)
      .where("tenant_id", "=", context.tenantId)
      .execute();
    return true;
  });
  return changed ? findProductCategory(db, context, publicId) : undefined;
}

export async function pageProductCategoryRecords(db:Kysely<Database>,context:ModuleContext,input:unknown){
 const result=await pageModuleRecords(db,query(db).where('product_categories.tenant_id','=',context.tenantId).where('product_categories.deleted_at','is',null),input,{"name":{"field":"name"},"sortOrder":{"field":"sortOrder"},"active":{"field":"active","boolean":true}});
 return result;
}
