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
export const hsnCodeValuesSchema = z
  .object({
    name: z
      .string()
      .trim()
      .min(1, "Enter a name.")
      .max(120, "Use at most 120 characters."),
    code: codeSchema.refine((value) => value.length <= 12, "Code is too long."),
    description: z.string().trim().max(2000).default(""),
    sortOrder: z.number().int().min(0).max(1000000).default(0),
    active: z.boolean(),
  })
  .strict();
export type HsnCodeValues = z.infer<typeof hsnCodeValuesSchema>;
export type HsnCode = HsnCodeValues & RecordAudit & { public_id: string };
