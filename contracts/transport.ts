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
export const transportValuesSchema = z
  .object({
    name: z
      .string()
      .trim()
      .min(1, "Enter a name.")
      .max(120, "Use at most 120 characters."),
    gst: z.string().trim().max(300).default(""),
    vehicleNo: z.string().trim().max(300).default(""),
    address: z.string().trim().max(300).default(""),
    contactNo: z.string().trim().max(300).default(""),
    contactPerson: z.string().trim().max(300).default(""),
    sortOrder: z.number().int().min(0).max(1000000).default(0),
    active: z.boolean(),
  })
  .strict();
export type TransportValues = z.infer<typeof transportValuesSchema>;
export type Transport = TransportValues & RecordAudit & { public_id: string };
