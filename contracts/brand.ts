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
export const brandValuesSchema = z
  .object({
    name: z
      .string()
      .trim()
      .min(1, "Enter a name.")
      .max(120, "Use at most 120 characters."),
    logoUrl: websiteSchema.default(""),
    logoAlt: z.string().trim().max(300).default(""),
    showOnStorefront: z.boolean().default(false),
    sortOrder: z.number().int().min(0).max(1000000).default(0),
    active: z.boolean(),
  })
  .strict();
export type BrandValues = z.infer<typeof brandValuesSchema>;
export type Brand = BrandValues & RecordAudit & { public_id: string };
