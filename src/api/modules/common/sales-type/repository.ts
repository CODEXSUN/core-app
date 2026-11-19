import {pageModuleRecords} from '../../../database/page.ts';
import { randomInt } from "node:crypto";
import { sql, type Kysely } from "kysely";
import type { Database } from "../../../database/schema.ts";
import type { ModuleContext } from "../../../database/context.ts";
import { ConflictError } from "../../../http.ts";
import type { SalesTypeValues } from "../../../../../contracts/sales-type.ts";

const alphabet = "abcdefghijklmnopqrstuvwxyz0123456789";
export function generateSalesTypePublicId() {
  return Array.from(
    { length: 8 },
    () => alphabet[randomInt(alphabet.length)],
  ).join("");
}
function query(db: Kysely<Database>) {
  return db
    .selectFrom("sales_types")

    .select([
      "sales_types.id",
      "sales_types.public_id",
      "sales_types.name",
      "sales_types.active",
      "sales_types.created_at",
      "sales_types.updated_at",
      "sales_types.created_by",
      "sales_types.updated_by",
      "sales_types.description",
      "sales_types.sort_order as sortOrder",
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
export async function listSalesType(
  db: Kysely<Database>,
  context: ModuleContext,
) {
  const rows = await query(db)
    .where("sales_types.tenant_id", "=", context.tenantId)
    .where("sales_types.deleted_at", "is", null)
    .orderBy("sales_types.name")
    .execute();
  return rows.map(publicRecord);
}
export async function findSalesType(
  db: Kysely<Database>,
  context: ModuleContext,
  publicId: string,
) {
  const row = await query(db)
    .where("sales_types.tenant_id", "=", context.tenantId)
    .where("sales_types.public_id", "=", publicId)
    .where("sales_types.deleted_at", "is", null)
    .executeTakeFirst();
  return row ? publicRecord(row) : undefined;
}
export async function findInternalSalesType(
  db: Kysely<Database>,
  context: ModuleContext,
  publicId: string,
) {
  const row = await query(db)
    .where("sales_types.tenant_id", "=", context.tenantId)
    .where("sales_types.public_id", "=", publicId)
    .where("sales_types.deleted_at", "is", null)
    .forShare("sales_types")
    .executeTakeFirst();
  return row ? { ...publicRecord(row), id: row.id } : undefined;
}
async function editable(
  db: Kysely<Database>,
  context: ModuleContext,
  values: SalesTypeValues,
) {
  return {
    name: values.name,
    active: values.active,
    description: values.description,
    sort_order: values.sortOrder,
  };
}
export async function insertSalesType(
  db: Kysely<Database>,
  context: ModuleContext,
  values: SalesTypeValues,
  generate = generateSalesTypePublicId,
) {
  for (let attempt = 0; attempt < 5; attempt++) {
    try {
      const publicId = generate();
      await db.transaction().execute(async (transaction) => {
        const data = await editable(transaction, context, values);
        await transaction
          .insertInto("sales_types")
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
      const saved = await findSalesType(db, context, publicId);
      if (!saved) throw new Error("Saved record could not be read.");
      return saved;
    } catch (error) {
      const failure = error as { code?: string; constraint?: string };
      if (
        failure.code !== "23505" ||
        failure.constraint !== "sales_types_public_id_unique"
      )
        throw error;
      if (attempt === 4) throw new Error("Unable to allocate a public ID.");
    }
  }
  throw new Error("Unable to allocate a public ID.");
}
export async function updateSalesType(
  db: Kysely<Database>,
  context: ModuleContext,
  publicId: string,
  values: SalesTypeValues,
) {
  const changed = await db.transaction().execute(async (transaction) => {
    const existing = await transaction
      .selectFrom("sales_types")
      .selectAll()
      .where("tenant_id", "=", context.tenantId)
      .where("public_id", "=", publicId)
      .where("deleted_at", "is", null)
      .forUpdate()
      .executeTakeFirst();
    if (!existing) return false;
    const data = await editable(transaction, context, values);
    await transaction
      .updateTable("sales_types")
      .set({ ...data, updated_at: new Date(), updated_by: context.actorId })
      .where("id", "=", existing.id)
      .where("tenant_id", "=", context.tenantId)
      .execute();
    return true;
  });
  return changed ? findSalesType(db, context, publicId) : undefined;
}

export async function pageSalesTypeRecords(db:Kysely<Database>,context:ModuleContext,input:unknown){
 const result=await pageModuleRecords(db,query(db).where('sales_types.tenant_id','=',context.tenantId).where('sales_types.deleted_at','is',null),input,{"name":{"field":"name"},"description":{"field":"description"},"sortOrder":{"field":"sortOrder"},"active":{"field":"active","boolean":true}});
 return result;
}
