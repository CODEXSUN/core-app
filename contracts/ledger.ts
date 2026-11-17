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
export const ledgerValuesSchema = z
  .object({
    name: z
      .string()
      .trim()
      .min(1, "Enter a name.")
      .max(120, "Use at most 120 characters."),
    ledgerGroupId: z
      .string()
      .regex(/^[a-z0-9]{8}$/, "Select a valid ledger group."),
    sortOrder: z.number().int().min(0).max(1000000).default(0),
    active: z.boolean(),
  })
  .strict();
export type LedgerValues = z.infer<typeof ledgerValuesSchema>;
export type Ledger = LedgerValues &
  RecordAudit & { public_id: string; ledgerGroupName: string };
