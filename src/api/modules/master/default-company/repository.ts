import { randomInt } from "node:crypto";
import { sql, type Kysely } from "kysely";
import type { Database } from "../../../database/schema.ts";
import type { ModuleContext } from "../../../database/context.ts";
import { ConflictError } from "../../../http.ts";
import type { DefaultCompanyValues } from "../../../../../contracts/default-company.ts";
import { resolveCompanyReference } from "../../master/company/index.ts";
import { resolveFinancialYearReference } from "../../master/financial-year/index.ts";

const alphabet = "abcdefghijklmnopqrstuvwxyz0123456789";
export function generateDefaultCompanyPublicId() {
  return Array.from(
    { length: 8 },
    () => alphabet[randomInt(alphabet.length)],
  ).join("");
}
function query(db: Kysely<Database>) {
  return db
    .selectFrom("default_companies")
    .leftJoin("companies as companyIdRef", (join) =>
      join
        .onRef("companyIdRef.id", "=", "default_companies.company_id")
        .onRef("companyIdRef.tenant_id", "=", "default_companies.tenant_id"),
    )
    .leftJoin("financial_years as financialYearIdRef", (join) =>
      join
        .onRef(
          "financialYearIdRef.id",
          "=",
          "default_companies.financial_year_id",
        )
        .onRef(
          "financialYearIdRef.tenant_id",
          "=",
          "default_companies.tenant_id",
        ),
    )
    .select([
      "default_companies.id",
      "default_companies.public_id",
      "default_companies.name",
      "default_companies.active",
      "default_companies.created_at",
      "default_companies.updated_at",
      "default_companies.created_by",
      "default_companies.updated_by",
      "default_companies.landing_app as landingApp",
      "companyIdRef.public_id as companyId",
      "companyIdRef.name as companyName",
      "financialYearIdRef.public_id as financialYearId",
      "financialYearIdRef.name as financialYearName",
    ] as const);
}
type Row = NonNullable<
  Awaited<ReturnType<ReturnType<typeof query>["executeTakeFirst"]>>
>;
function publicRecord(row: Row) {
  const { id, ...rest } = row;
  return {
    ...rest,
    companyId: row.companyId ?? "",
    companyName: row.companyName ?? "",
    financialYearId: row.financialYearId ?? "",
    financialYearName: row.financialYearName ?? "",
    created_at: row.created_at.toISOString(),
    updated_at: row.updated_at.toISOString(),
  };
}
export async function listDefaultCompany(
  db: Kysely<Database>,
  context: ModuleContext,
) {
  const rows = await query(db)
    .where("default_companies.tenant_id", "=", context.tenantId)
    .where("default_companies.deleted_at", "is", null)
    .orderBy("default_companies.name")
    .execute();
  return rows.map(publicRecord);
}
export async function findDefaultCompany(
  db: Kysely<Database>,
  context: ModuleContext,
  publicId: string,
) {
  const row = await query(db)
    .where("default_companies.tenant_id", "=", context.tenantId)
    .where("default_companies.public_id", "=", publicId)
    .where("default_companies.deleted_at", "is", null)
    .executeTakeFirst();
  return row ? publicRecord(row) : undefined;
}
export async function findInternalDefaultCompany(
  db: Kysely<Database>,
  context: ModuleContext,
  publicId: string,
) {
  const row = await query(db)
    .where("default_companies.tenant_id", "=", context.tenantId)
    .where("default_companies.public_id", "=", publicId)
    .where("default_companies.deleted_at", "is", null)
    .forShare("default_companies")
    .executeTakeFirst();
  return row ? { ...publicRecord(row), id: row.id } : undefined;
}
async function editable(
  db: Kysely<Database>,
  context: ModuleContext,
  values: DefaultCompanyValues,
) {
  const companyId = await resolveCompanyReference(
    db,
    context,
    values.companyId,
  );
  const financialYearId = await resolveFinancialYearReference(
    db,
    context,
    values.financialYearId,
  );

  return {
    name: values.name,
    active: values.active,
    company_id: companyId?.id ?? null,
    financial_year_id: financialYearId?.id ?? null,
    landing_app: values.landingApp,
  };
}
export async function insertDefaultCompany(
  db: Kysely<Database>,
  context: ModuleContext,
  values: DefaultCompanyValues,
  generate = generateDefaultCompanyPublicId,
) {
  for (let attempt = 0; attempt < 5; attempt++) {
    try {
      const publicId = generate();
      await db.transaction().execute(async (transaction) => {
        await sql`select pg_advisory_xact_lock(hashtextextended(${context.tenantId + ":default-company"}, 0))`.execute(
          transaction,
        );
        const data = await editable(transaction, context, values);
        await transaction
          .insertInto("default_companies")
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
      const saved = await findDefaultCompany(db, context, publicId);
      if (!saved) throw new Error("Saved record could not be read.");
      return saved;
    } catch (error) {
      const failure = error as { code?: string; constraint?: string };
      if (
        failure.code !== "23505" ||
        failure.constraint !== "default_companies_public_id_unique"
      )
        throw error;
      if (attempt === 4) throw new Error("Unable to allocate a public ID.");
    }
  }
  throw new Error("Unable to allocate a public ID.");
}
export async function updateDefaultCompany(
  db: Kysely<Database>,
  context: ModuleContext,
  publicId: string,
  values: DefaultCompanyValues,
) {
  const changed = await db.transaction().execute(async (transaction) => {
    await sql`select pg_advisory_xact_lock(hashtextextended(${context.tenantId + ":default-company"}, 0))`.execute(
      transaction,
    );
    const existing = await transaction
      .selectFrom("default_companies")
      .selectAll()
      .where("tenant_id", "=", context.tenantId)
      .where("public_id", "=", publicId)
      .where("deleted_at", "is", null)
      .forUpdate()
      .executeTakeFirst();
    if (!existing) return false;
    const data = await editable(transaction, context, values);
    await transaction
      .updateTable("default_companies")
      .set({ ...data, updated_at: new Date(), updated_by: context.actorId })
      .where("id", "=", existing.id)
      .where("tenant_id", "=", context.tenantId)
      .execute();
    return true;
  });
  return changed ? findDefaultCompany(db, context, publicId) : undefined;
}
