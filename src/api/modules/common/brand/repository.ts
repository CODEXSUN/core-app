import {pageModuleRecords} from '../../../database/page.ts';
import { randomInt } from "node:crypto";
import { sql, type Kysely } from "kysely";
import type { Database } from "../../../database/schema.ts";
import type { ModuleContext } from "../../../database/context.ts";
import { ConflictError } from "../../../http.ts";
import type { BrandValues } from "../../../../../contracts/brand.ts";

const alphabet = "abcdefghijklmnopqrstuvwxyz0123456789";
export function generateBrandPublicId() {
  return Array.from(
    { length: 8 },
    () => alphabet[randomInt(alphabet.length)],
  ).join("");
}
function query(db: Kysely<Database>) {
  return db
    .selectFrom("brands")

    .select([
      "brands.id",
      "brands.public_id",
      "brands.name",
      "brands.active",
      "brands.created_at",
      "brands.updated_at",
      "brands.created_by",
      "brands.updated_by",
      "brands.logo_url as logoUrl",
      "brands.logo_alt as logoAlt",
      "brands.show_on_storefront as showOnStorefront",
      "brands.sort_order as sortOrder",
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
export async function listBrand(db: Kysely<Database>, context: ModuleContext) {
  const rows = await query(db)
    .where("brands.tenant_id", "=", context.tenantId)
    .where("brands.deleted_at", "is", null)
    .orderBy("brands.name")
    .execute();
  return rows.map(publicRecord);
}
export async function findBrand(
  db: Kysely<Database>,
  context: ModuleContext,
  publicId: string,
) {
  const row = await query(db)
    .where("brands.tenant_id", "=", context.tenantId)
    .where("brands.public_id", "=", publicId)
    .where("brands.deleted_at", "is", null)
    .executeTakeFirst();
  return row ? publicRecord(row) : undefined;
}
export async function findInternalBrand(
  db: Kysely<Database>,
  context: ModuleContext,
  publicId: string,
) {
  const row = await query(db)
    .where("brands.tenant_id", "=", context.tenantId)
    .where("brands.public_id", "=", publicId)
    .where("brands.deleted_at", "is", null)
    .forShare("brands")
    .executeTakeFirst();
  return row ? { ...publicRecord(row), id: row.id } : undefined;
}
async function editable(
  db: Kysely<Database>,
  context: ModuleContext,
  values: BrandValues,
) {
  return {
    name: values.name,
    active: values.active,
    logo_url: values.logoUrl,
    logo_alt: values.logoAlt,
    show_on_storefront: values.showOnStorefront,
    sort_order: values.sortOrder,
  };
}
export async function insertBrand(
  db: Kysely<Database>,
  context: ModuleContext,
  values: BrandValues,
  generate = generateBrandPublicId,
) {
  for (let attempt = 0; attempt < 5; attempt++) {
    try {
      const publicId = generate();
      await db.transaction().execute(async (transaction) => {
        const data = await editable(transaction, context, values);
        await transaction
          .insertInto("brands")
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
      const saved = await findBrand(db, context, publicId);
      if (!saved) throw new Error("Saved record could not be read.");
      return saved;
    } catch (error) {
      const failure = error as { code?: string; constraint?: string };
      if (
        failure.code !== "23505" ||
        failure.constraint !== "brands_public_id_unique"
      )
        throw error;
      if (attempt === 4) throw new Error("Unable to allocate a public ID.");
    }
  }
  throw new Error("Unable to allocate a public ID.");
}
export async function updateBrand(
  db: Kysely<Database>,
  context: ModuleContext,
  publicId: string,
  values: BrandValues,
) {
  const changed = await db.transaction().execute(async (transaction) => {
    const existing = await transaction
      .selectFrom("brands")
      .selectAll()
      .where("tenant_id", "=", context.tenantId)
      .where("public_id", "=", publicId)
      .where("deleted_at", "is", null)
      .forUpdate()
      .executeTakeFirst();
    if (!existing) return false;
    const data = await editable(transaction, context, values);
    await transaction
      .updateTable("brands")
      .set({ ...data, updated_at: new Date(), updated_by: context.actorId })
      .where("id", "=", existing.id)
      .where("tenant_id", "=", context.tenantId)
      .execute();
    return true;
  });
  return changed ? findBrand(db, context, publicId) : undefined;
}

export async function pageBrandRecords(db:Kysely<Database>,context:ModuleContext,input:unknown){
 const result=await pageModuleRecords(db,query(db).where('brands.tenant_id','=',context.tenantId).where('brands.deleted_at','is',null),input,{"name":{"field":"name"},"logoUrl":{"field":"logoUrl"},"logoAlt":{"field":"logoAlt"},"showOnStorefront":{"field":"showOnStorefront","boolean":true},"sortOrder":{"field":"sortOrder"},"active":{"field":"active","boolean":true}});
 return result;
}
