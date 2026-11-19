import {pageModuleRecords} from '../../../database/page.ts';
import { randomInt } from "node:crypto";
import { sql, type Kysely } from "kysely";
import type { Database } from "../../../database/schema.ts";
import type { ModuleContext } from "../../../database/context.ts";
import { ConflictError } from "../../../http.ts";
import type { WarehouseValues } from "../../../../../contracts/warehouse.ts";

const alphabet = "abcdefghijklmnopqrstuvwxyz0123456789";
export function generateWarehousePublicId() {
  return Array.from(
    { length: 8 },
    () => alphabet[randomInt(alphabet.length)],
  ).join("");
}
function query(db: Kysely<Database>) {
  return db
    .selectFrom("warehouses")

    .select([
      "warehouses.id",
      "warehouses.public_id",
      "warehouses.name",
      "warehouses.active",
      "warehouses.created_at",
      "warehouses.updated_at",
      "warehouses.created_by",
      "warehouses.updated_by",
      "warehouses.sort_order as sortOrder",
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
export async function listWarehouse(
  db: Kysely<Database>,
  context: ModuleContext,
) {
  const rows = await query(db)
    .where("warehouses.tenant_id", "=", context.tenantId)
    .where("warehouses.deleted_at", "is", null)
    .orderBy("warehouses.name")
    .execute();
  return rows.map(publicRecord);
}
export async function findWarehouse(
  db: Kysely<Database>,
  context: ModuleContext,
  publicId: string,
) {
  const row = await query(db)
    .where("warehouses.tenant_id", "=", context.tenantId)
    .where("warehouses.public_id", "=", publicId)
    .where("warehouses.deleted_at", "is", null)
    .executeTakeFirst();
  return row ? publicRecord(row) : undefined;
}
export async function findInternalWarehouse(
  db: Kysely<Database>,
  context: ModuleContext,
  publicId: string,
) {
  const row = await query(db)
    .where("warehouses.tenant_id", "=", context.tenantId)
    .where("warehouses.public_id", "=", publicId)
    .where("warehouses.deleted_at", "is", null)
    .forShare("warehouses")
    .executeTakeFirst();
  return row ? { ...publicRecord(row), id: row.id } : undefined;
}
async function editable(
  db: Kysely<Database>,
  context: ModuleContext,
  values: WarehouseValues,
) {
  return {
    name: values.name,
    active: values.active,
    sort_order: values.sortOrder,
  };
}
export async function insertWarehouse(
  db: Kysely<Database>,
  context: ModuleContext,
  values: WarehouseValues,
  generate = generateWarehousePublicId,
) {
  for (let attempt = 0; attempt < 5; attempt++) {
    try {
      const publicId = generate();
      await db.transaction().execute(async (transaction) => {
        const data = await editable(transaction, context, values);
        await transaction
          .insertInto("warehouses")
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
      const saved = await findWarehouse(db, context, publicId);
      if (!saved) throw new Error("Saved record could not be read.");
      return saved;
    } catch (error) {
      const failure = error as { code?: string; constraint?: string };
      if (
        failure.code !== "23505" ||
        failure.constraint !== "warehouses_public_id_unique"
      )
        throw error;
      if (attempt === 4) throw new Error("Unable to allocate a public ID.");
    }
  }
  throw new Error("Unable to allocate a public ID.");
}
export async function updateWarehouse(
  db: Kysely<Database>,
  context: ModuleContext,
  publicId: string,
  values: WarehouseValues,
) {
  const changed = await db.transaction().execute(async (transaction) => {
    const existing = await transaction
      .selectFrom("warehouses")
      .selectAll()
      .where("tenant_id", "=", context.tenantId)
      .where("public_id", "=", publicId)
      .where("deleted_at", "is", null)
      .forUpdate()
      .executeTakeFirst();
    if (!existing) return false;
    const data = await editable(transaction, context, values);
    await transaction
      .updateTable("warehouses")
      .set({ ...data, updated_at: new Date(), updated_by: context.actorId })
      .where("id", "=", existing.id)
      .where("tenant_id", "=", context.tenantId)
      .execute();
    return true;
  });
  return changed ? findWarehouse(db, context, publicId) : undefined;
}

export async function pageWarehouseRecords(db:Kysely<Database>,context:ModuleContext,input:unknown){
 const result=await pageModuleRecords(db,query(db).where('warehouses.tenant_id','=',context.tenantId).where('warehouses.deleted_at','is',null),input,{"name":{"field":"name"},"sortOrder":{"field":"sortOrder"},"active":{"field":"active","boolean":true}});
 return result;
}
