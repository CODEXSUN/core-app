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
export const pincodeValuesSchema = z
  .object({
    name: z
      .string()
      .trim()
      .min(1, "Enter a name.")
      .max(120, "Use at most 120 characters."),
    cityId: z.string().regex(/^[a-z0-9]{8}$/, "Select a valid city."),
    area: z.string().trim().max(300).default(""),
    sortOrder: z.number().int().min(0).max(1000000).default(0),
    active: z.boolean(),
  })
  .strict();
export type PincodeValues = z.infer<typeof pincodeValuesSchema>;
export type Pincode = PincodeValues &
  RecordAudit & { public_id: string; cityName: string };
