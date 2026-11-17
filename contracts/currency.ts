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
export const currencyValuesSchema = z
  .object({
    name: z
      .string()
      .trim()
      .regex(/^[A-Za-z]{3}$/, "Use a three-letter currency code.")
      .transform((value) => value.toUpperCase()),
    symbol: z.string().trim().min(1, "Enter a value.").max(10),
    sortOrder: z.number().int().min(0).max(1000000).default(0),
    active: z.boolean(),
  })
  .strict();
export type CurrencyValues = z.infer<typeof currencyValuesSchema>;
export type Currency = CurrencyValues & RecordAudit & { public_id: string };
