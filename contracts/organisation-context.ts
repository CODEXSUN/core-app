import type { Company } from "./company.ts";
import type { FinancialYear } from "./financial-year.ts";
import type { DefaultCompany } from "./default-company.ts";
export type OrganisationContext = {
  defaults: DefaultCompany;
  company: Company;
  financialYear: FinancialYear;
};
