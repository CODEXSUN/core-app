import {pageModuleRecords} from '../../../database/page.ts';
import { randomInt } from "node:crypto";
import { sql, type Kysely } from "kysely";
import type { Database } from "../../../database/schema.ts";
import type { ModuleContext } from "../../../database/context.ts";
import { ConflictError } from "../../../http.ts";
import type { MonthValues } from "../../../../../contracts/month.ts";

const alphabet = "abcdefghijklmnopqrstuvwxyz0123456789";
export function generateMonthPublicId() {
  return Array.from(
    { length: 8 },
    () => alphabet[randomInt(alphabet.length)],
  ).join("");
}
function query(db: Kysely<Database>) {
  return db
    .selectFrom("months")

    .select([
      "months.id",
      "months.public_id",
      "months.name",
      "months.active",
      "months.created_at",
      "months.updated_at",
      "months.created_by",
      "months.updated_by",
      "months.start_date as startDate",
      "months.end_date as endDate",
      "months.sort_order as sortOrder",
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
export async function listMonth(db: Kysely<Database>, context: ModuleContext) {
  const rows = await query(db)
    .where("months.tenant_id", "=", context.tenantId)
    .where("months.deleted_at", "is", null)
    .orderBy("months.name")
    .execute();
  return rows.map(publicRecord);
}
export async function findMonth(
  db: Kysely<Database>,
  context: ModuleContext,
  publicId: string,
) {
  const row = await query(db)
    .where("months.tenant_id", "=", context.tenantId)
    .where("months.public_id", "=", publicId)
    .where("months.deleted_at", "is", null)
    .executeTakeFirst();
  return row ? publicRecord(row) : undefined;
}
export async function findInternalMonth(
  db: Kysely<Database>,
  context: ModuleContext,
  publicId: string,
) {
  const row = await query(db)
    .where("months.tenant_id", "=", context.tenantId)
    .where("months.public_id", "=", publicId)
    .where("months.deleted_at", "is", null)
    .forShare("months")
    .executeTakeFirst();
  return row ? { ...publicRecord(row), id: row.id } : undefined;
}
async function editable(
  db: Kysely<Database>,
  context: ModuleContext,
  values: MonthValues,
) {
  return {
    name: values.name,
    active: values.active,
    start_date: values.startDate,
    end_date: values.endDate,
    sort_order: values.sortOrder,
  };
}
export async function insertMonth(
  db: Kysely<Database>,
  context: ModuleContext,
  values: MonthValues,
  generate = generateMonthPublicId,
) {
  for (let attempt = 0; attempt < 5; attempt++) {
    try {
      const publicId = generate();
      await db.transaction().execute(async (transaction) => {
        const data = await editable(transaction, context, values);
        await transaction
          .insertInto("months")
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
      const saved = await findMonth(db, context, publicId);
      if (!saved) throw new Error("Saved record could not be read.");
      return saved;
    } catch (error) {
      const failure = error as { code?: string; constraint?: string };
      if (
        failure.code !== "23505" ||
        failure.constraint !== "months_public_id_unique"
      )
        throw error;
      if (attempt === 4) throw new Error("Unable to allocate a public ID.");
    }
  }
  throw new Error("Unable to allocate a public ID.");
}
export async function updateMonth(
  db: Kysely<Database>,
  context: ModuleContext,
  publicId: string,
  values: MonthValues,
) {
  const changed = await db.transaction().execute(async (transaction) => {
    const existing = await transaction
      .selectFrom("months")
      .selectAll()
      .where("tenant_id", "=", context.tenantId)
      .where("public_id", "=", publicId)
      .where("deleted_at", "is", null)
      .forUpdate()
      .executeTakeFirst();
    if (!existing) return false;
    const data = await editable(transaction, context, values);
    await transaction
      .updateTable("months")
      .set({ ...data, updated_at: new Date(), updated_by: context.actorId })
      .where("id", "=", existing.id)
      .where("tenant_id", "=", context.tenantId)
      .execute();
    return true;
  });
  return changed ? findMonth(db, context, publicId) : undefined;
}

export async function pageMonthRecords(db:Kysely<Database>,context:ModuleContext,input:unknown){
 const result=await pageModuleRecords(db,query(db).where('months.tenant_id','=',context.tenantId).where('months.deleted_at','is',null),input,{"name":{"field":"name"},"startDate":{"field":"startDate"},"endDate":{"field":"endDate"},"sortOrder":{"field":"sortOrder"},"active":{"field":"active","boolean":true}});
 return result;
}
