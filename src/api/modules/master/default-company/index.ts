import type { Kysely } from "kysely";
import type { Database } from "../../../database/schema.ts";
import {
  requireModulePermission,
  type ModuleContext,
} from "../../../database/context.ts";
import { ConflictError } from "../../../http.ts";
import {
  findInternalDefaultCompany,
  listDefaultCompany,
} from "./repository.ts";
import { resolveCompanyReference } from "../company/index.ts";
import { resolveFinancialYearReference } from "../financial-year/index.ts";
export async function listDefaultCompanyRecords(
  db: Kysely<Database>,
  context: ModuleContext,
) {
  requireModulePermission(context, "master/default-company:read");
  return listDefaultCompany(db, context);
}
// Public in-app reference boundary. The owning module verifies scope, permission and active state.
export async function resolveDefaultCompanyReference(
  db: Kysely<Database>,
  context: ModuleContext,
  publicId: string,
) {
  requireModulePermission(context, "master/default-company:read");
  const record = await findInternalDefaultCompany(db, context, publicId);
  if (!record || !record.active)
    throw new ConflictError(
      "Selected default company was not found or is inactive.",
    );
  return record;
}
export async function getCurrentDefaultCompany(
  db: Kysely<Database>,
  context: ModuleContext,
) {
  requireModulePermission(context, "master/default-company:read");
  return (await listDefaultCompany(db, context)).find(
    (record) => record.active,
  );
}
export async function getOrganisationContext(
  db: Kysely<Database>,
  context: ModuleContext,
) {
  const defaults = await getCurrentDefaultCompany(db, context);
  if (!defaults) return undefined;
  const company = await resolveCompanyReference(
    db,
    context,
    defaults.companyId,
  );
  const financialYear = await resolveFinancialYearReference(
    db,
    context,
    defaults.financialYearId,
  );
  const { id: companyInternalId, ...publicCompany } = company;
  const { id: yearInternalId, ...publicYear } = financialYear;
  return { defaults, company: publicCompany, financialYear: publicYear };
}

export async function assertCompanyNotSelected(
  db: Kysely<Database>,
  context: ModuleContext,
  companyId: number,
) {
  const record = await db
    .selectFrom("default_companies")
    .select("id")
    .where("tenant_id", "=", context.tenantId)
    .where("company_id", "=", companyId)
    .where("active", "=", true)
    .executeTakeFirst();
  if (record)
    throw new ConflictError(
      "Choose another default company before deactivating this company.",
    );
}
export async function assertFinancialYearNotSelected(
  db: Kysely<Database>,
  context: ModuleContext,
  financialYearId: number,
) {
  const record = await db
    .selectFrom("default_companies")
    .select("id")
    .where("tenant_id", "=", context.tenantId)
    .where("financial_year_id", "=", financialYearId)
    .where("active", "=", true)
    .executeTakeFirst();
  if (record)
    throw new ConflictError(
      "Choose another default financial year before deactivating this year.",
    );
}
