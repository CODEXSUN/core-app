/** Public, host-callable Core application port for the explicitly bound legacy store. */
export { createLegacyContactPort } from "../src/api/modules/master/contact/legacy/service.ts";
export { legacyContactValuesSchema } from "./legacy-contact.ts";
export type {
  LegacyContactValues,
  LegacyContactDetail,
  LegacyContactOptions,
  LegacySqlTransaction,
  LegacyContactScope,
} from "./legacy-contact.ts";
