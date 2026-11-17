import type { Kysely } from "kysely";
import type { Database } from "./database/schema.ts";
import type { ModuleContext } from "./database/context.ts";
import type { Address, BankAccount } from "../../contracts/party.ts";
import { ConflictError } from "./http.ts";
import { resolveCountryReference } from "./modules/common/country/index.ts";
import { resolveStateReference } from "./modules/common/state/index.ts";
import { resolveDistrictReference } from "./modules/common/district/index.ts";
import { resolveCityReference } from "./modules/common/city/index.ts";
import { resolvePincodeReference } from "./modules/common/pincode/index.ts";
import { resolveAddressTypeReference } from "./modules/common/address-type/index.ts";
import { resolveBankNameReference } from "./modules/common/bank-name/index.ts";

// Company and Contact own these party value objects. Their referenced masters
// validate scope through their public boundaries inside the same transaction.
export async function validatePartyReferences(
  db: Kysely<Database>,
  context: ModuleContext,
  values: { addresses: Address[]; bankAccounts: BankAccount[] },
) {
  for (const address of values.addresses) {
    if (address.addressTypeId)
      await resolveAddressTypeReference(db, context, address.addressTypeId);
    const country = address.countryId
      ? await resolveCountryReference(db, context, address.countryId)
      : null;
    const state = address.stateId
      ? await resolveStateReference(db, context, address.stateId)
      : null;
    const district = address.districtId
      ? await resolveDistrictReference(db, context, address.districtId)
      : null;
    const city = address.cityId
      ? await resolveCityReference(db, context, address.cityId)
      : null;
    const pincode = address.pincodeId
      ? await resolvePincodeReference(db, context, address.pincodeId)
      : null;
    if (
      (state && state.countryId !== country?.public_id) ||
      (district && district.stateId !== state?.public_id) ||
      (city && city.districtId !== district?.public_id) ||
      (pincode && pincode.cityId !== city?.public_id)
    ) {
      throw new ConflictError(
        "Choose a consistent country, state, district, city and postal-code hierarchy.",
      );
    }
    if (country) address.country = country.name;
    if (state) address.state = state.name;
    if (city) address.city = city.name;
    if (pincode) address.postalCode = pincode.name;
  }
  for (const account of values.bankAccounts) {
    if (account.bankNameId)
      account.bankName = (
        await resolveBankNameReference(db, context, account.bankNameId)
      ).name;
  }
}
