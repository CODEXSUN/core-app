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
export const contactValuesSchema = z
  .object({
    name: z
      .string()
      .trim()
      .min(1, "Enter a name.")
      .max(120, "Use at most 120 characters."),
    code: codeSchema.refine((value) => value.length <= 40, "Code is too long."),
    legalName: z.string().trim().max(200).default(""),
    role: z.enum(["customer", "supplier", "both", "other"]).default("customer"),
    typeId: z
      .string()
      .regex(/^[a-z0-9]{8}$/, "Select a valid contact type.")
      .or(z.literal(""))
      .default(""),
    groupId: z
      .string()
      .regex(/^[a-z0-9]{8}$/, "Select a valid contact group.")
      .or(z.literal(""))
      .default(""),
    gstin: taxIdSchema.default(""),
    pan: taxIdSchema.default(""),
    website: websiteSchema.default(""),
    description: z.string().trim().max(2000).default(""),
    msmeNo: z.string().trim().max(300).default(""),
    msmeCategory: z.string().trim().max(300).default(""),
    tanNo: z.string().trim().max(300).default(""),
    tdsAvailable: z.boolean().default(false),
    tcsAvailable: z.boolean().default(false),
    creditLimit: decimalSchema.default("0.0000"),
    emails: emailsSchema.default([]),
    phones: phonesSchema.default([]),
    addresses: addressesSchema.default([]),
    bankAccounts: bankAccountsSchema.default([]),
    socialLinks: socialLinksSchema.default([]),
    active: z.boolean(),
  })
  .strict();
export type ContactValues = z.infer<typeof contactValuesSchema>;
export type Contact = ContactValues &
  RecordAudit & { public_id: string; typeName: string; groupName: string };
