import { useCallback } from "react";
import type { MasterListRemoteQuery } from "@workspace/ui/blocks/data-table";
import { UpsertFormField } from "@workspace/ui/blocks/upsert-form";
import type { Address } from "../../../../contracts/party";
import { loadCountryReferencePage, getCountryReference } from "../common/country";
import { loadStateReferencePage, getState } from "../common/state";
import { loadDistrictReferencePage, getDistrict } from "../common/district";
import { loadCityReferencePage, getCity } from "../common/city";
import { loadPincodeReferencePage, getPincode } from "../common/pincode";
import { loadAddressTypeReferencePage, getAddressTypeReference } from "../common/address-type";
import { ReferencePicker } from "./reference-picker";
export function AddressReferences({
  id,
  index,
  address,
  onChange,
}: {
  id: string;
  index: number;
  address: Address;
  onChange: (patch: Partial<Address>) => void;
}) {
  const states = useCallback((query: MasterListRemoteQuery, signal: AbortSignal) =>
    loadStateReferencePage(query, signal, {countryId: address.countryId}), [address.countryId]);
  const state = useCallback(async (publicId: string, signal: AbortSignal) => {
    const record = await getState(publicId, signal);
    if (address.countryId && record.countryId !== address.countryId)
      throw new Error("The selected state does not belong to the selected country. Existing address text is preserved.");
    return record;
  }, [address.countryId]);
  const districts = useCallback((query: MasterListRemoteQuery, signal: AbortSignal) =>
    loadDistrictReferencePage(query, signal, {stateId: address.stateId}), [address.stateId]);
  const district = useCallback(async (publicId: string, signal: AbortSignal) => {
    const record = await getDistrict(publicId, signal);
    if (address.stateId && record.stateId !== address.stateId)
      throw new Error("The selected district does not belong to the selected state. Existing address text is preserved.");
    return record;
  }, [address.stateId]);
  const cities = useCallback((query: MasterListRemoteQuery, signal: AbortSignal) =>
    loadCityReferencePage(query, signal, {districtId: address.districtId}), [address.districtId]);
  const city = useCallback(async (publicId: string, signal: AbortSignal) => {
    const record = await getCity(publicId, signal);
    if (address.districtId && record.districtId !== address.districtId)
      throw new Error("The selected city does not belong to the selected district. Existing address text is preserved.");
    return record;
  }, [address.districtId]);
  const pincodes = useCallback((query: MasterListRemoteQuery, signal: AbortSignal) =>
    loadPincodeReferencePage(query, signal, {cityId: address.cityId}), [address.cityId]);
  const pincode = useCallback(async (publicId: string, signal: AbortSignal) => {
    const record = await getPincode(publicId, signal);
    if (address.cityId && record.cityId !== address.cityId)
      throw new Error("The selected postal code does not belong to the selected city. Existing address text is preserved.");
    return record;
  }, [address.cityId]);
  return (
    <div className="space-y-3">
      <UpsertFormField
        idPrefix={id}
        name={"address-reference-type-" + index}
        label="Address type reference"
        helper="Optional managed address type."
      >
        <ReferencePicker
          ariaLabel={"Address type reference " + (index + 1)}
          loadPage={loadAddressTypeReferencePage}
          loadSelected={getAddressTypeReference}
          value={address.addressTypeId}
          onValueChange={(addressTypeId) => onChange({ addressTypeId })}
        />
      </UpsertFormField>
      <UpsertFormField
        idPrefix={id}
        name={"country-reference-" + index}
        label="Country reference"
        helper="Select the country before its locations."
      >
        <ReferencePicker
          ariaLabel={"Country reference " + (index + 1)}
          loadPage={loadCountryReferencePage}
          loadSelected={getCountryReference}
          value={address.countryId}
          onValueChange={(countryId, option) =>
            onChange({
              countryId,
              country: option?.name ?? address.country,
              stateId: "",
              districtId: "",
              cityId: "",
              pincodeId: "",
            })
          }
        />
      </UpsertFormField>
      <UpsertFormField
        idPrefix={id}
        name={"state-reference-" + index}
        label="State reference"
        helper="States in the selected country."
      >
        <ReferencePicker
          ariaLabel={"State reference " + (index + 1)}
          loadPage={states}
          loadSelected={state}
          scopeKey={address.countryId}
          disabled={!address.countryId}
          value={address.stateId}
          onValueChange={(stateId, option) =>
            onChange({
              stateId,
              state: option?.name ?? address.state,
              districtId: "",
              cityId: "",
              pincodeId: "",
            })
          }
        />
      </UpsertFormField>
      <UpsertFormField
        idPrefix={id}
        name={"district-reference-" + index}
        label="District reference"
        helper="Districts in the selected state."
      >
        <ReferencePicker
          ariaLabel={"District reference " + (index + 1)}
          loadPage={districts}
          loadSelected={district}
          scopeKey={address.stateId}
          disabled={!address.stateId}
          value={address.districtId}
          onValueChange={(districtId) =>
            onChange({ districtId, cityId: "", pincodeId: "" })
          }
        />
      </UpsertFormField>
      <UpsertFormField
        idPrefix={id}
        name={"city-reference-" + index}
        label="City reference"
        helper="Cities in the selected district."
      >
        <ReferencePicker
          ariaLabel={"City reference " + (index + 1)}
          loadPage={cities}
          loadSelected={city}
          scopeKey={address.districtId}
          disabled={!address.districtId}
          value={address.cityId}
          onValueChange={(cityId, option) =>
            onChange({
              cityId,
              city: option?.name ?? address.city,
              pincodeId: "",
            })
          }
        />
      </UpsertFormField>
      <UpsertFormField
        idPrefix={id}
        name={"pincode-reference-" + index}
        label="Postal-code reference"
        helper="Postal codes in the selected city."
      >
        <ReferencePicker
          ariaLabel={"Postal-code reference " + (index + 1)}
          loadPage={pincodes}
          loadSelected={pincode}
          scopeKey={address.cityId}
          disabled={!address.cityId}
          value={address.pincodeId}
          onValueChange={(pincodeId, option) =>
            onChange({
              pincodeId,
              postalCode: option?.name ?? address.postalCode,
            })
          }
        />
      </UpsertFormField>
    </div>
  );
}
