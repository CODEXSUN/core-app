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
export const stateValuesSchema = z
  .object({
    name: z
      .string()
      .trim()
      .min(1, "Enter a name.")
      .max(120, "Use at most 120 characters."),
    countryId: z.string().regex(/^[a-z0-9]{8}$/, "Select a valid country."),
    code: codeSchema.refine((value) => value.length <= 10, "Code is too long."),
    sortOrder: z.number().int().min(0).max(1000000).default(0),
    active: z.boolean(),
  })
  .strict();
export type StateValues = z.infer<typeof stateValuesSchema>;
export type State = StateValues &
  RecordAudit & { public_id: string; countryName: string };
