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
export const productValuesSchema = z
  .object({
    name: z
      .string()
      .trim()
      .min(1, "Enter a name.")
      .max(120, "Use at most 120 characters."),
    typeId: z
      .string()
      .regex(/^[a-z0-9]{8}$/, "Select a valid product type.")
      .or(z.literal(""))
      .default(""),
    productCategoryId: z
      .string()
      .regex(/^[a-z0-9]{8}$/, "Select a valid category.")
      .or(z.literal(""))
      .default(""),
    productGroupId: z
      .string()
      .regex(/^[a-z0-9]{8}$/, "Select a valid group.")
      .or(z.literal(""))
      .default(""),
    hsnCodeId: z
      .string()
      .regex(/^[a-z0-9]{8}$/, "Select a valid hsn code.")
      .or(z.literal(""))
      .default(""),
    unitId: z.string().regex(/^[a-z0-9]{8}$/, "Select a valid unit."),
    taxId: z
      .string()
      .regex(/^[a-z0-9]{8}$/, "Select a valid tax.")
      .or(z.literal(""))
      .default(""),
    brandId: z
      .string()
      .regex(/^[a-z0-9]{8}$/, "Select a valid brand.")
      .or(z.literal(""))
      .default(""),
    openingStock: decimalSchema.default("0.0000"),
    openingRate: decimalSchema.default("0.0000"),
    description: z.string().trim().max(2000).default(""),
    active: z.boolean(),
  })
  .strict();
export type ProductValues = z.infer<typeof productValuesSchema>;
export type Product = ProductValues &
  RecordAudit & {
    public_id: string;
    taxRate: string;
    hsnCode: string;
    typeName: string;
    productCategoryName: string;
    productGroupName: string;
    hsnCodeName: string;
    unitName: string;
    taxName: string;
    brandName: string;
  };
