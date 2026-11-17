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
export const workOrderValuesSchema = z
  .object({
    name: z
      .string()
      .trim()
      .min(1, "Enter a name.")
      .max(120, "Use at most 120 characters."),
    code: codeSchema.refine((value) => value.length <= 40, "Code is too long."),
    active: z.boolean(),
  })
  .strict();
export type WorkOrderValues = z.infer<typeof workOrderValuesSchema>;
export type WorkOrder = WorkOrderValues & RecordAudit & { public_id: string };
