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
export const ledgerGroupValuesSchema = z
  .object({
    name: z
      .string()
      .trim()
      .min(1, "Enter a name.")
      .max(120, "Use at most 120 characters."),
    sortOrder: z.number().int().min(0).max(1000000).default(0),
    active: z.boolean(),
  })
  .strict();
export type LedgerGroupValues = z.infer<typeof ledgerGroupValuesSchema>;
export type LedgerGroup = LedgerGroupValues &
  RecordAudit & { public_id: string };
