import {pageModuleRecords} from '../../../database/page.ts';
import { randomInt } from "node:crypto";
import { sql, type Kysely } from "kysely";
import type { Database } from "../../../database/schema.ts";
import type { ModuleContext } from "../../../database/context.ts";
import { ConflictError } from "../../../http.ts";
import type { WorkOrderValues } from "../../../../../contracts/work-order.ts";

const alphabet = "abcdefghijklmnopqrstuvwxyz0123456789";
export function generateWorkOrderPublicId() {
  return Array.from(
    { length: 8 },
    () => alphabet[randomInt(alphabet.length)],
  ).join("");
}
function query(db: Kysely<Database>) {
  return db
    .selectFrom("work_orders")

    .select([
      "work_orders.id",
      "work_orders.public_id",
      "work_orders.name",
      "work_orders.active",
      "work_orders.created_at",
      "work_orders.updated_at",
      "work_orders.created_by",
      "work_orders.updated_by",
      "work_orders.code",
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
export async function listWorkOrder(
  db: Kysely<Database>,
  context: ModuleContext,
) {
  const rows = await query(db)
    .where("work_orders.tenant_id", "=", context.tenantId)
    .where("work_orders.deleted_at", "is", null)
    .orderBy("work_orders.name")
    .execute();
  return rows.map(publicRecord);
}
export async function findWorkOrder(
  db: Kysely<Database>,
  context: ModuleContext,
  publicId: string,
) {
  const row = await query(db)
    .where("work_orders.tenant_id", "=", context.tenantId)
    .where("work_orders.public_id", "=", publicId)
    .where("work_orders.deleted_at", "is", null)
    .executeTakeFirst();
  return row ? publicRecord(row) : undefined;
}
export async function findInternalWorkOrder(
  db: Kysely<Database>,
  context: ModuleContext,
  publicId: string,
) {
  const row = await query(db)
    .where("work_orders.tenant_id", "=", context.tenantId)
    .where("work_orders.public_id", "=", publicId)
    .where("work_orders.deleted_at", "is", null)
    .forShare("work_orders")
    .executeTakeFirst();
  return row ? { ...publicRecord(row), id: row.id } : undefined;
}
async function editable(
  db: Kysely<Database>,
  context: ModuleContext,
  values: WorkOrderValues,
) {
  return { name: values.name, active: values.active, code: values.code };
}
export async function insertWorkOrder(
  db: Kysely<Database>,
  context: ModuleContext,
  values: WorkOrderValues,
  generate = generateWorkOrderPublicId,
) {
  for (let attempt = 0; attempt < 5; attempt++) {
    try {
      const publicId = generate();
      await db.transaction().execute(async (transaction) => {
        const data = await editable(transaction, context, values);
        await transaction
          .insertInto("work_orders")
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
      const saved = await findWorkOrder(db, context, publicId);
      if (!saved) throw new Error("Saved record could not be read.");
      return saved;
    } catch (error) {
      const failure = error as { code?: string; constraint?: string };
      if (
        failure.code !== "23505" ||
        failure.constraint !== "work_orders_public_id_unique"
      )
        throw error;
      if (attempt === 4) throw new Error("Unable to allocate a public ID.");
    }
  }
  throw new Error("Unable to allocate a public ID.");
}
export async function updateWorkOrder(
  db: Kysely<Database>,
  context: ModuleContext,
  publicId: string,
  values: WorkOrderValues,
) {
  const changed = await db.transaction().execute(async (transaction) => {
    const existing = await transaction
      .selectFrom("work_orders")
      .selectAll()
      .where("tenant_id", "=", context.tenantId)
      .where("public_id", "=", publicId)
      .where("deleted_at", "is", null)
      .forUpdate()
      .executeTakeFirst();
    if (!existing) return false;
    const data = await editable(transaction, context, values);
    await transaction
      .updateTable("work_orders")
      .set({ ...data, updated_at: new Date(), updated_by: context.actorId })
      .where("id", "=", existing.id)
      .where("tenant_id", "=", context.tenantId)
      .execute();
    return true;
  });
  return changed ? findWorkOrder(db, context, publicId) : undefined;
}

export async function pageWorkOrderRecords(db:Kysely<Database>,context:ModuleContext,input:unknown){
 const result=await pageModuleRecords(db,query(db).where('work_orders.tenant_id','=',context.tenantId).where('work_orders.deleted_at','is',null),input,{"name":{"field":"name"},"code":{"field":"code"},"active":{"field":"active","boolean":true}});
 return result;
}
