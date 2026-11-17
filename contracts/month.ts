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
export const monthValuesSchema = z
  .object({
    name: z
      .string()
      .trim()
      .min(1, "Enter a name.")
      .max(120, "Use at most 120 characters."),
    startDate: z.iso.date("Enter a valid calendar date."),
    endDate: z.iso.date("Enter a valid calendar date."),
    sortOrder: z.number().int().min(0).max(1000000).default(0),
    active: z.boolean(),
  })
  .strict()
  .refine((value) => value.startDate <= value.endDate, {
    message: "End date must not precede start date.",
    path: ["endDate"],
  });
export type MonthValues = z.infer<typeof monthValuesSchema>;
export type Month = MonthValues & RecordAudit & { public_id: string };
