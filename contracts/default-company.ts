import { z } from "zod";
import { decimalSchema } from "./values.ts";
import {
  websiteSchema,
  codeSchema,
  taxIdSchema,
  emailsSchema,
  phonesSchema,
  addressesSchema,
  bankAccountsSchema,
  socialLinksSchema,
  type RecordAudit,
} from "./party.ts";
export const defaultCompanyValuesSchema = z
  .object({
    name: z
      .string()
      .trim()
      .min(1, "Enter a name.")
      .max(120, "Use at most 120 characters."),
    companyId: z.string().regex(/^[a-z0-9]{8}$/, "Select a valid company."),
    financialYearId: z
      .string()
      .regex(/^[a-z0-9]{8}$/, "Select a valid financial year."),
    landingApp: z
      .enum([
        "application",
        "billing",
        "crm",
        "mail",
        "task-manager",
        "qcafe",
        "hrms",
        "docs",
        "himsx",
        "codexsun",
        "sites",
      ])
      .default("application"),
    active: z.boolean(),
  })
  .strict();
export type DefaultCompanyValues = z.infer<typeof defaultCompanyValuesSchema>;
export type DefaultCompany = DefaultCompanyValues &
  RecordAudit & {
    public_id: string;
    companyName: string;
    financialYearName: string;
  };
