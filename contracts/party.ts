import { z } from "zod";

// Adapted from CODEXSUN Company/Contact value objects. Location masters are not
// imported into this first delivery; address labels are explicit free-text data.
export const emailSchema = z
  .object({
    email: z.email().max(254),
    label: z.string().trim().max(40).default("Work"),
    isPrimary: z.boolean().default(false),
  })
  .strict();
export const phoneSchema = z
  .object({
    phone: z
      .string()
      .trim()
      .min(7)
      .max(30)
      .regex(/^[+\d() .-]+$/),
    label: z.string().trim().max(40).default("Work"),
    isPrimary: z.boolean().default(false),
  })
  .strict();
export const addressSchema = z
  .object({
    addressTypeId: z
      .string()
      .regex(/^[a-z0-9]{8}$/)
      .or(z.literal(""))
      .default(""),
    countryId: z
      .string()
      .regex(/^[a-z0-9]{8}$/)
      .or(z.literal(""))
      .default(""),
    stateId: z
      .string()
      .regex(/^[a-z0-9]{8}$/)
      .or(z.literal(""))
      .default(""),
    districtId: z
      .string()
      .regex(/^[a-z0-9]{8}$/)
      .or(z.literal(""))
      .default(""),
    cityId: z
      .string()
      .regex(/^[a-z0-9]{8}$/)
      .or(z.literal(""))
      .default(""),
    pincodeId: z
      .string()
      .regex(/^[a-z0-9]{8}$/)
      .or(z.literal(""))
      .default(""),
    label: z
      .enum(["billing", "shipping", "registered", "other"])
      .default("billing"),
    addressLine1: z.string().trim().min(1).max(200),
    addressLine2: z.string().trim().max(200).default(""),
    city: z.string().trim().max(100).default(""),
    state: z.string().trim().max(100).default(""),
    postalCode: z.string().trim().max(20).default(""),
    country: z.string().trim().min(2).max(100),
    isDefault: z.boolean().default(false),
  })
  .strict();
export const emailsSchema = z
  .array(emailSchema)
  .max(20)
  .refine(
    (values) => values.filter((value) => value.isPrimary).length <= 1,
    "Choose at most one primary email.",
  );
export const phonesSchema = z
  .array(phoneSchema)
  .max(20)
  .refine(
    (values) => values.filter((value) => value.isPrimary).length <= 1,
    "Choose at most one primary phone.",
  );
export const addressesSchema = z
  .array(addressSchema)
  .max(20)
  .refine(
    (values) => values.filter((value) => value.isDefault).length <= 1,
    "Choose at most one default address.",
  );
export const codeSchema = z
  .string()
  .trim()
  .min(1, "Enter a code.")
  .max(40, "Use at most 40 characters.")
  .regex(
    /^[A-Za-z0-9][A-Za-z0-9._-]*$/,
    "Use letters, numbers, periods, underscores or hyphens; start with a letter or number.",
  )
  .transform((value) => value.toUpperCase());
export const taxIdSchema = z
  .string()
  .trim()
  .max(20)
  .regex(/^[A-Za-z0-9]*$/)
  .transform((value) => value.toUpperCase());
export const websiteSchema = z.union([
  z.literal(""),
  z
    .url()
    .max(300)
    .refine(
      (value) => ["http:", "https:"].includes(new URL(value).protocol),
      "Use an HTTP or HTTPS website.",
    ),
]);
export type Address = z.infer<typeof addressSchema>;
export type PartyEmail = z.infer<typeof emailSchema>;
export type PartyPhone = z.infer<typeof phoneSchema>;
export const bankAccountSchema = z
  .object({
    bankNameId: z
      .string()
      .regex(/^[a-z0-9]{8}$/)
      .or(z.literal(""))
      .default(""),
    bankName: z.string().trim().max(120),
    accountType: z.string().trim().max(40),
    accountNumber: z.string().trim().min(1).max(40),
    holderName: z.string().trim().max(200),
    ifsc: z.string().trim().max(20),
    branch: z.string().trim().max(200),
    isPrimary: z.boolean(),
  })
  .strict();
export const bankAccountsSchema = z
  .array(bankAccountSchema)
  .max(20)
  .refine(
    (values) => values.filter((value) => value.isPrimary).length <= 1,
    "Choose at most one primary bank account.",
  );
export const socialLinkSchema = z
  .object({
    platform: z.string().trim().min(1).max(40),
    url: websiteSchema.refine((value) => value !== "", "Enter a link."),
    active: z.boolean(),
  })
  .strict();
export const socialLinksSchema = z.array(socialLinkSchema).max(20);
export type BankAccount = z.infer<typeof bankAccountSchema>;
export type SocialLink = z.infer<typeof socialLinkSchema>;
export type RecordAudit = {
  created_at: string;
  updated_at: string;
  created_by: string;
  updated_by: string;
};
