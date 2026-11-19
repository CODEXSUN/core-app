import {pageModuleRecords} from '../../../database/page.ts';
import { randomInt } from "node:crypto";
import { sql, type Kysely } from "kysely";
import type { Database } from "../../../database/schema.ts";
import type { ModuleContext } from "../../../database/context.ts";
import { ConflictError } from "../../../http.ts";
import type { StockRejectionTypeValues } from "../../../../../contracts/stock-rejection-type.ts";

const alphabet = "abcdefghijklmnopqrstuvwxyz0123456789";
export function generateStockRejectionTypePublicId() {
  return Array.from(
    { length: 8 },
    () => alphabet[randomInt(alphabet.length)],
  ).join("");
}
function query(db: Kysely<Database>) {
  return db
    .selectFrom("stock_rejection_types")

    .select([
      "stock_rejection_types.id",
      "stock_rejection_types.public_id",
      "stock_rejection_types.name",
      "stock_rejection_types.active",
      "stock_rejection_types.created_at",
      "stock_rejection_types.updated_at",
      "stock_rejection_types.created_by",
      "stock_rejection_types.updated_by",
      "stock_rejection_types.sort_order as sortOrder",
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
export async function listStockRejectionType(
  db: Kysely<Database>,
  context: ModuleContext,
) {
  const rows = await query(db)
    .where("stock_rejection_types.tenant_id", "=", context.tenantId)
    .where("stock_rejection_types.deleted_at", "is", null)
    .orderBy("stock_rejection_types.name")
    .execute();
  return rows.map(publicRecord);
}
export async function findStockRejectionType(
  db: Kysely<Database>,
  context: ModuleContext,
  publicId: string,
) {
  const row = await query(db)
    .where("stock_rejection_types.tenant_id", "=", context.tenantId)
    .where("stock_rejection_types.public_id", "=", publicId)
    .where("stock_rejection_types.deleted_at", "is", null)
    .executeTakeFirst();
  return row ? publicRecord(row) : undefined;
}
export async function findInternalStockRejectionType(
  db: Kysely<Database>,
  context: ModuleContext,
  publicId: string,
) {
  const row = await query(db)
    .where("stock_rejection_types.tenant_id", "=", context.tenantId)
    .where("stock_rejection_types.public_id", "=", publicId)
    .where("stock_rejection_types.deleted_at", "is", null)
    .forShare("stock_rejection_types")
    .executeTakeFirst();
  return row ? { ...publicRecord(row), id: row.id } : undefined;
}
async function editable(
  db: Kysely<Database>,
  context: ModuleContext,
  values: StockRejectionTypeValues,
) {
  return {
    name: values.name,
    active: values.active,
    sort_order: values.sortOrder,
  };
}
export async function insertStockRejectionType(
  db: Kysely<Database>,
  context: ModuleContext,
  values: StockRejectionTypeValues,
  generate = generateStockRejectionTypePublicId,
) {
  for (let attempt = 0; attempt < 5; attempt++) {
    try {
      const publicId = generate();
      await db.transaction().execute(async (transaction) => {
        const data = await editable(transaction, context, values);
        await transaction
          .insertInto("stock_rejection_types")
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
      const saved = await findStockRejectionType(db, context, publicId);
      if (!saved) throw new Error("Saved record could not be read.");
      return saved;
    } catch (error) {
      const failure = error as { code?: string; constraint?: string };
      if (
        failure.code !== "23505" ||
        failure.constraint !== "stock_rejection_types_public_id_unique"
      )
        throw error;
      if (attempt === 4) throw new Error("Unable to allocate a public ID.");
    }
  }
  throw new Error("Unable to allocate a public ID.");
}
export async function updateStockRejectionType(
  db: Kysely<Database>,
  context: ModuleContext,
  publicId: string,
  values: StockRejectionTypeValues,
) {
  const changed = await db.transaction().execute(async (transaction) => {
    const existing = await transaction
      .selectFrom("stock_rejection_types")
      .selectAll()
      .where("tenant_id", "=", context.tenantId)
      .where("public_id", "=", publicId)
      .where("deleted_at", "is", null)
      .forUpdate()
      .executeTakeFirst();
    if (!existing) return false;
    const data = await editable(transaction, context, values);
    await transaction
      .updateTable("stock_rejection_types")
      .set({ ...data, updated_at: new Date(), updated_by: context.actorId })
      .where("id", "=", existing.id)
      .where("tenant_id", "=", context.tenantId)
      .execute();
    return true;
  });
  return changed ? findStockRejectionType(db, context, publicId) : undefined;
}

export async function pageStockRejectionTypeRecords(db:Kysely<Database>,context:ModuleContext,input:unknown){
 const result=await pageModuleRecords(db,query(db).where('stock_rejection_types.tenant_id','=',context.tenantId).where('stock_rejection_types.deleted_at','is',null),input,{"name":{"field":"name"},"sortOrder":{"field":"sortOrder"},"active":{"field":"active","boolean":true}});
 return result;
}
