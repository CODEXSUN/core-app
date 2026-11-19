import {pageModuleRecords} from '../../../database/page.ts';
import { assertFinancialYearNotSelected } from "../default-company/index.ts";
import { randomInt } from "node:crypto";
import { sql, type Kysely } from "kysely";
import type { Database } from "../../../database/schema.ts";
import type { ModuleContext } from "../../../database/context.ts";
import { ConflictError } from "../../../http.ts";
import type { FinancialYearValues } from "../../../../../contracts/financial-year.ts";

const alphabet = "abcdefghijklmnopqrstuvwxyz0123456789";
export function generateFinancialYearPublicId() {
  return Array.from(
    { length: 8 },
    () => alphabet[randomInt(alphabet.length)],
  ).join("");
}
function query(db: Kysely<Database>) {
  return db
    .selectFrom("financial_years")

    .select([
      "financial_years.id",
      "financial_years.public_id",
      "financial_years.name",
      "financial_years.active",
      "financial_years.created_at",
      "financial_years.updated_at",
      "financial_years.created_by",
      "financial_years.updated_by",
      "financial_years.start_date as startDate",
      "financial_years.end_date as endDate",
      "financial_years.is_current as isCurrent",
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
export async function listFinancialYear(
  db: Kysely<Database>,
  context: ModuleContext,
) {
  const rows = await query(db)
    .where("financial_years.tenant_id", "=", context.tenantId)
    .where("financial_years.deleted_at", "is", null)
    .orderBy("financial_years.name")
    .execute();
  return rows.map(publicRecord);
}
export async function findFinancialYear(
  db: Kysely<Database>,
  context: ModuleContext,
  publicId: string,
) {
  const row = await query(db)
    .where("financial_years.tenant_id", "=", context.tenantId)
    .where("financial_years.public_id", "=", publicId)
    .where("financial_years.deleted_at", "is", null)
    .executeTakeFirst();
  return row ? publicRecord(row) : undefined;
}
export async function findInternalFinancialYear(
  db: Kysely<Database>,
  context: ModuleContext,
  publicId: string,
) {
  const row = await query(db)
    .where("financial_years.tenant_id", "=", context.tenantId)
    .where("financial_years.public_id", "=", publicId)
    .where("financial_years.deleted_at", "is", null)
    .forShare("financial_years")
    .executeTakeFirst();
  return row ? { ...publicRecord(row), id: row.id } : undefined;
}
async function editable(
  db: Kysely<Database>,
  context: ModuleContext,
  values: FinancialYearValues,
) {
  return {
    name: values.name,
    active: values.active,
    start_date: values.startDate,
    end_date: values.endDate,
    is_current: values.isCurrent,
  };
}
export async function insertFinancialYear(
  db: Kysely<Database>,
  context: ModuleContext,
  values: FinancialYearValues,
  generate = generateFinancialYearPublicId,
) {
  for (let attempt = 0; attempt < 5; attempt++) {
    try {
      const publicId = generate();
      await db.transaction().execute(async (transaction) => {
        await sql`select pg_advisory_xact_lock(hashtextextended(${context.tenantId + ":financial-year"}, 0))`.execute(
          transaction,
        );
        const data = await editable(transaction, context, values);
        if (values.isCurrent)
          await transaction
            .updateTable("financial_years")
            .set({
              is_current: false,
              updated_by: context.actorId,
              updated_at: new Date(),
            })
            .where("tenant_id", "=", context.tenantId)
            .where("is_current", "=", true)
            .execute();
        await transaction
          .insertInto("financial_years")
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
      const saved = await findFinancialYear(db, context, publicId);
      if (!saved) throw new Error("Saved record could not be read.");
      return saved;
    } catch (error) {
      const failure = error as { code?: string; constraint?: string };
      if (
        failure.code !== "23505" ||
        failure.constraint !== "financial_years_public_id_unique"
      )
        throw error;
      if (attempt === 4) throw new Error("Unable to allocate a public ID.");
    }
  }
  throw new Error("Unable to allocate a public ID.");
}
export async function updateFinancialYear(
  db: Kysely<Database>,
  context: ModuleContext,
  publicId: string,
  values: FinancialYearValues,
) {
  const changed = await db.transaction().execute(async (transaction) => {
    await sql`select pg_advisory_xact_lock(hashtextextended(${context.tenantId + ":financial-year"}, 0))`.execute(
      transaction,
    );
    const existing = await transaction
      .selectFrom("financial_years")
      .selectAll()
      .where("tenant_id", "=", context.tenantId)
      .where("public_id", "=", publicId)
      .where("deleted_at", "is", null)
      .forUpdate()
      .executeTakeFirst();
    if (!existing) return false;
    if (!values.active)
      await assertFinancialYearNotSelected(transaction, context, existing.id);
    const data = await editable(transaction, context, values);
    if (values.isCurrent)
      await transaction
        .updateTable("financial_years")
        .set({
          is_current: false,
          updated_by: context.actorId,
          updated_at: new Date(),
        })
        .where("tenant_id", "=", context.tenantId)
        .where("is_current", "=", true)
        .execute();
    await transaction
      .updateTable("financial_years")
      .set({ ...data, updated_at: new Date(), updated_by: context.actorId })
      .where("id", "=", existing.id)
      .where("tenant_id", "=", context.tenantId)
      .execute();
    return true;
  });
  return changed ? findFinancialYear(db, context, publicId) : undefined;
}

export async function pageFinancialYearRecords(db:Kysely<Database>,context:ModuleContext,input:unknown){
 const result=await pageModuleRecords(db,query(db).where('financial_years.tenant_id','=',context.tenantId).where('financial_years.deleted_at','is',null),input,{"name":{"field":"name"},"startDate":{"field":"startDate"},"endDate":{"field":"endDate"},"isCurrent":{"field":"isCurrent","boolean":true},"active":{"field":"active","boolean":true}});
 return result;
}
