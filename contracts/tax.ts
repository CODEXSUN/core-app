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
export const taxValuesSchema = z
  .object({
    name: z
      .string()
      .trim()
      .min(1, "Enter a name.")
      .max(120, "Use at most 120 characters."),
    ratePercent: decimalSchema.default("0.0000"),
    description: z.string().trim().max(2000).default(""),
    sortOrder: z.number().int().min(0).max(1000000).default(0),
    active: z.boolean(),
  })
  .strict()
  .refine((value) => Number(value.ratePercent) <= 100, {
    message: "Rate must be between zero and 100.",
    path: ["ratePercent"],
  });
export type TaxValues = z.infer<typeof taxValuesSchema>;
export type Tax = TaxValues & RecordAudit & { public_id: string };
