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
export const financialYearValuesSchema = z
  .object({
    name: z
      .string()
      .trim()
      .min(1, "Enter a name.")
      .max(120, "Use at most 120 characters."),
    startDate: z.iso.date("Enter a valid calendar date."),
    endDate: z.iso.date("Enter a valid calendar date."),
    isCurrent: z.boolean().default(false),
    active: z.boolean(),
  })
  .strict()
  .refine((value) => value.startDate < value.endDate, {
    message: "End date must be after start date.",
    path: ["endDate"],
  })
  .refine((value) => !value.isCurrent || value.active, {
    message: "The current financial year must be active.",
    path: ["active"],
  });
export type FinancialYearValues = z.infer<typeof financialYearValuesSchema>;
export type FinancialYear = FinancialYearValues &
  RecordAudit & { public_id: string };
