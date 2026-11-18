import { z } from "zod";
export const legacyPublicId = z
  .string()
  .regex(/^[a-z0-9]{8}$/, "Select a valid record.");
const ref = legacyPublicId.or(z.literal(""));
const text = (max: number) => z.string().trim().max(max);
const money = z
  .string()
  .regex(
    /^-?\d{1,16}(\.\d{1,2})?$/,
    "Enter an amount with at most two decimals.",
  );
const child = { public_id: ref.optional() };
export const legacyContactValuesSchema = z
  .object({
    name: text(191).min(1, "Enter a contact name."),
    code: text(80),
    legalName: text(191),
    typeId: legacyPublicId,
    groupId: ref,
    gstin: text(40),
    pan: text(40),
    msmeNo: text(80),
    msmeCategory: text(80),
    tanNo: text(80),
    tdsAvailable: z.boolean(),
    tcsAvailable: z.boolean(),
    openingBalance: money,
    creditLimit: money.refine(
      (value) => Number(value) >= 0,
      "Credit limit cannot be negative.",
    ),
    website: text(255).refine(
      (value) => !value || /^https?:\/\/[^\s]+$/i.test(value),
      "Enter an http or https website.",
    ),
    description: text(10000),
    active: z.boolean(),
    phones: z
      .array(
        z
          .object({
            ...child,
            phone: text(80).refine(
              (value) => /^\d{7,15}$/.test(value.replace(/\D/g, "")),
              "Enter a valid phone number.",
            ),
            phoneType: z.enum([
              "Mobile",
              "WhatsApp",
              "Landline",
              "Work",
              "Other",
            ]),
            isPrimary: z.boolean(),
          })
          .strict(),
      )
      .min(1, "Add a mobile number.")
      .max(30),
    emails: z
      .array(
        z
          .object({
            ...child,
            email: z.string().trim().toLowerCase().pipe(z.email().max(191)),
            emailType: text(80).min(1),
            isPrimary: z.boolean(),
          })
          .strict(),
      )
      .max(30),
    addresses: z
      .array(
        z
          .object({
            ...child,
            addressTypeId: ref,
            addressLine1: text(255).min(1, "Enter an address."),
            addressLine2: text(255),
            countryId: ref,
            stateId: ref,
            districtId: ref,
            cityId: ref,
            pincodeId: ref,
            isDefault: z.boolean(),
          })
          .strict(),
      )
      .max(30),
    bankAccounts: z
      .array(
        z
          .object({
            ...child,
            bankNameId: ref,
            accountType: text(80),
            accountNumber: text(120).min(1),
            holderName: text(191),
            ifsc: text(40),
            branch: text(191),
            isPrimary: z.boolean(),
          })
          .strict(),
      )
      .max(30),
    socialLinks: z
      .array(
        z
          .object({
            ...child,
            platform: text(80).min(1),
            url: text(255).refine(
              (value) => /^https?:\/\/[^\s]+$/i.test(value),
              "Enter an http or https link.",
            ),
            active: z.boolean(),
          })
          .strict(),
      )
      .max(30),
  })
  .strict()
  .superRefine((value, ctx) => {
    const mobile = value.phones.filter((row) =>
      ["Mobile", "WhatsApp"].includes(row.phoneType),
    );
    if (!mobile.length)
      ctx.addIssue({
        code: "custom",
        path: ["phones"],
        message: "Add at least one Mobile or WhatsApp number.",
      });
    if (mobile.some((row) => !/^\d{10}$/.test(row.phone)))
      ctx.addIssue({
        code: "custom",
        path: ["phones"],
        message: "Mobile and WhatsApp numbers must have 10 digits.",
      });
    for (const key of ["phones", "emails", "bankAccounts"] as const) {
      const rows = value[key];
      if (rows.length && rows.filter((row) => row.isPrimary).length !== 1)
        ctx.addIssue({
          code: "custom",
          path: [key],
          message: "Choose exactly one primary entry.",
        });
    }
    if (
      value.addresses.length &&
      value.addresses.filter((row) => row.isDefault).length !== 1
    )
      ctx.addIssue({
        code: "custom",
        path: ["addresses"],
        message: "Choose one default address.",
      });
    if (
      new Set(value.phones.map((row) => row.phone.replace(/\D/g, ""))).size !==
      value.phones.length
    )
      ctx.addIssue({
        code: "custom",
        path: ["phones"],
        message: "Phone numbers must be unique.",
      });
    if (
      new Set(value.emails.map((row) => row.email.toLowerCase())).size !==
      value.emails.length
    )
      ctx.addIssue({
        code: "custom",
        path: ["emails"],
        message: "Email addresses must be unique.",
      });
  });
export type LegacyContactValues = z.infer<typeof legacyContactValuesSchema>;
export type LegacyContactDetail = LegacyContactValues & {
  public_id: string;
  typeName: string;
  groupName: string;
  createdBy: string;
  createdAt: string;
  updatedAt: string;
  revision: string;
};
export type LegacyLookup = {
  public_id: string;
  name: string;
  active: boolean;
  parentId?: string;
};
export type LegacyContactOptions = Record<
  | "types"
  | "groups"
  | "addressTypes"
  | "banks"
  | "countries"
  | "states"
  | "districts"
  | "cities"
  | "pincodes",
  LegacyLookup[]
>;
/** Host-owned transaction port. The Core implementation alone owns contact SQL. */
export type LegacySqlTransaction = {
  query<T = Record<string, unknown>>(
    statement: string,
    parameters?: readonly unknown[],
  ): Promise<T[]>;
};
export type LegacyContactScope = {
  tenantId: string;
  boundTenantId: string;
  actorEmail: string;
  authorize: (operation: "read" | "create" | "update") => void;
};
