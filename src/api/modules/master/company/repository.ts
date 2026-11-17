import { assertCompanyNotSelected } from "../default-company/index.ts";
import { randomInt } from "node:crypto";
import { sql, type Kysely } from "kysely";
import type { Database } from "../../../database/schema.ts";
import type { ModuleContext } from "../../../database/context.ts";
import { ConflictError } from "../../../http.ts";
import type { CompanyValues } from "../../../../../contracts/company.ts";

import { validatePartyReferences } from "../../../party-references.ts";
const alphabet = "abcdefghijklmnopqrstuvwxyz0123456789";
export function generateCompanyPublicId() {
  return Array.from(
    { length: 8 },
    () => alphabet[randomInt(alphabet.length)],
  ).join("");
}
function query(db: Kysely<Database>) {
  return db
    .selectFrom("companies")

    .select([
      "companies.id",
      "companies.public_id",
      "companies.name",
      "companies.active",
      "companies.created_at",
      "companies.updated_at",
      "companies.created_by",
      "companies.updated_by",
      "companies.code",
      "companies.legal_name as legalName",
      "companies.gstin",
      "companies.pan",
      "companies.website",
      "companies.description",
      "companies.msme_no as msmeNo",
      "companies.msme_category as msmeCategory",
      "companies.tan_no as tanNo",
      "companies.tds_available as tdsAvailable",
      "companies.tcs_available as tcsAvailable",
      "companies.logo_url as logoUrl",
      "companies.logo_dark_url as logoDarkUrl",
      "companies.favicon_url as faviconUrl",
      "companies.industry_name as industryName",
      "companies.emails",
      "companies.phones",
      "companies.addresses",
      "companies.bank_accounts as bankAccounts",
      "companies.social_links as socialLinks",
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
export async function listCompany(
  db: Kysely<Database>,
  context: ModuleContext,
) {
  const rows = await query(db)
    .where("companies.tenant_id", "=", context.tenantId)
    .where("companies.deleted_at", "is", null)
    .orderBy("companies.name")
    .execute();
  return rows.map(publicRecord);
}
export async function findCompany(
  db: Kysely<Database>,
  context: ModuleContext,
  publicId: string,
) {
  const row = await query(db)
    .where("companies.tenant_id", "=", context.tenantId)
    .where("companies.public_id", "=", publicId)
    .where("companies.deleted_at", "is", null)
    .executeTakeFirst();
  return row ? publicRecord(row) : undefined;
}
export async function findInternalCompany(
  db: Kysely<Database>,
  context: ModuleContext,
  publicId: string,
) {
  const row = await query(db)
    .where("companies.tenant_id", "=", context.tenantId)
    .where("companies.public_id", "=", publicId)
    .where("companies.deleted_at", "is", null)
    .forShare("companies")
    .executeTakeFirst();
  return row ? { ...publicRecord(row), id: row.id } : undefined;
}
async function editable(
  db: Kysely<Database>,
  context: ModuleContext,
  values: CompanyValues,
) {
  await validatePartyReferences(db, context, values);
  return {
    name: values.name,
    active: values.active,
    code: values.code,
    legal_name: values.legalName,
    gstin: values.gstin,
    pan: values.pan,
    website: values.website,
    description: values.description,
    msme_no: values.msmeNo,
    msme_category: values.msmeCategory,
    tan_no: values.tanNo,
    tds_available: values.tdsAvailable,
    tcs_available: values.tcsAvailable,
    logo_url: values.logoUrl,
    logo_dark_url: values.logoDarkUrl,
    favicon_url: values.faviconUrl,
    industry_name: values.industryName,
    emails: JSON.stringify(values.emails),
    phones: JSON.stringify(values.phones),
    addresses: JSON.stringify(values.addresses),
    bank_accounts: JSON.stringify(values.bankAccounts),
    social_links: JSON.stringify(values.socialLinks),
  };
}
export async function insertCompany(
  db: Kysely<Database>,
  context: ModuleContext,
  values: CompanyValues,
  generate = generateCompanyPublicId,
) {
  for (let attempt = 0; attempt < 5; attempt++) {
    try {
      const publicId = generate();
      await db.transaction().execute(async (transaction) => {
        const data = await editable(transaction, context, values);
        await transaction
          .insertInto("companies")
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
      const saved = await findCompany(db, context, publicId);
      if (!saved) throw new Error("Saved record could not be read.");
      return saved;
    } catch (error) {
      const failure = error as { code?: string; constraint?: string };
      if (
        failure.code !== "23505" ||
        failure.constraint !== "companies_public_id_unique"
      )
        throw error;
      if (attempt === 4) throw new Error("Unable to allocate a public ID.");
    }
  }
  throw new Error("Unable to allocate a public ID.");
}
export async function updateCompany(
  db: Kysely<Database>,
  context: ModuleContext,
  publicId: string,
  values: CompanyValues,
) {
  const changed = await db.transaction().execute(async (transaction) => {
    const existing = await transaction
      .selectFrom("companies")
      .selectAll()
      .where("tenant_id", "=", context.tenantId)
      .where("public_id", "=", publicId)
      .where("deleted_at", "is", null)
      .forUpdate()
      .executeTakeFirst();
    if (!existing) return false;
    if (!values.active)
      await assertCompanyNotSelected(transaction, context, existing.id);
    const data = await editable(transaction, context, values);
    await transaction
      .updateTable("companies")
      .set({ ...data, updated_at: new Date(), updated_by: context.actorId })
      .where("id", "=", existing.id)
      .where("tenant_id", "=", context.tenantId)
      .execute();
    return true;
  });
  return changed ? findCompany(db, context, publicId) : undefined;
}
