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
export const companyValuesSchema = z
  .object({
    name: z
      .string()
      .trim()
      .min(1, "Enter a name.")
      .max(120, "Use at most 120 characters."),
    code: codeSchema.refine((value) => value.length <= 40, "Code is too long."),
    legalName: z.string().trim().max(200).default(""),
    gstin: taxIdSchema.default(""),
    pan: taxIdSchema.default(""),
    website: websiteSchema.default(""),
    description: z.string().trim().max(2000).default(""),
    msmeNo: z.string().trim().max(300).default(""),
    msmeCategory: z.string().trim().max(300).default(""),
    tanNo: z.string().trim().max(300).default(""),
    tdsAvailable: z.boolean().default(false),
    tcsAvailable: z.boolean().default(false),
    logoUrl: websiteSchema.default(""),
    logoDarkUrl: websiteSchema.default(""),
    faviconUrl: websiteSchema.default(""),
    industryName: z.string().trim().max(300).default(""),
    emails: emailsSchema.default([]),
    phones: phonesSchema.default([]),
    addresses: addressesSchema.default([]),
    bankAccounts: bankAccountsSchema.default([]),
    socialLinks: socialLinksSchema.default([]),
    active: z.boolean(),
  })
  .strict();
export type CompanyValues = z.infer<typeof companyValuesSchema>;
export type Company = CompanyValues & RecordAudit & { public_id: string };
