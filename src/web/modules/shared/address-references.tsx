import { useEffect, useState } from "react";
import { FormLookup } from "@workspace/ui/blocks/form-controls/lookup";
import { UpsertFormField } from "@workspace/ui/blocks/upsert-form";
import type { Address } from "../../../../contracts/party";
import { loadCountry } from "../common/country";
import { loadState } from "../common/state";
import { loadDistrict } from "../common/district";
import { loadCity } from "../common/city";
import { loadPincode } from "../common/pincode";
import { loadAddressType } from "../common/address-type";

type Choice = {
  public_id: string;
  name: string;
  active: boolean;
  countryId?: string;
  stateId?: string;
  districtId?: string;
  cityId?: string;
};
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
  const [choices, setChoices] = useState<{
    countries: Choice[];
    states: Choice[];
    districts: Choice[];
    cities: Choice[];
    pincodes: Choice[];
    types: Choice[];
  }>({
    countries: [],
    states: [],
    districts: [],
    cities: [],
    pincodes: [],
    types: [],
  });
  const [error, setError] = useState("");
  useEffect(() => {
    let active = true;
    Promise.all([
      loadCountry(),
      loadState(),
      loadDistrict(),
      loadCity(),
      loadPincode(),
      loadAddressType(),
    ])
      .then(([countries, states, districts, cities, pincodes, types]) => {
        if (active)
          setChoices({ countries, states, districts, cities, pincodes, types });
      })
      .catch(() => {
        if (active)
          setError(
            "Location choices are unavailable. Existing address text is preserved.",
          );
      });
    return () => {
      active = false;
    };
  }, []);
  const options = (values: Choice[]) =>
    values
      .filter((value) => value.active)
      .map((value) => ({ value: value.public_id, label: value.name }));
  return (
    <div className="space-y-3">
      {error && <p role="alert">{error}</p>}
      <UpsertFormField
        idPrefix={id}
        name={"address-reference-type-" + index}
        label="Address type reference"
        helper="Optional managed address type."
      >
        <FormLookup
          ariaLabel={"Address type reference " + (index + 1)}
          allowTextValue={false}
          options={options(choices.types)}
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
        <FormLookup
          ariaLabel={"Country reference " + (index + 1)}
          allowTextValue={false}
          options={options(choices.countries)}
          value={address.countryId}
          onValueChange={(countryId, option) =>
            onChange({
              countryId,
              country: option?.label ?? address.country,
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
        <FormLookup
          ariaLabel={"State reference " + (index + 1)}
          allowTextValue={false}
          options={options(
            choices.states.filter(
              (value) => value.countryId === address.countryId,
            ),
          )}
          value={address.stateId}
          onValueChange={(stateId, option) =>
            onChange({
              stateId,
              state: option?.label ?? address.state,
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
        <FormLookup
          ariaLabel={"District reference " + (index + 1)}
          allowTextValue={false}
          options={options(
            choices.districts.filter(
              (value) => value.stateId === address.stateId,
            ),
          )}
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
        <FormLookup
          ariaLabel={"City reference " + (index + 1)}
          allowTextValue={false}
          options={options(
            choices.cities.filter(
              (value) => value.districtId === address.districtId,
            ),
          )}
          value={address.cityId}
          onValueChange={(cityId, option) =>
            onChange({
              cityId,
              city: option?.label ?? address.city,
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
        <FormLookup
          ariaLabel={"Postal-code reference " + (index + 1)}
          allowTextValue={false}
          options={options(
            choices.pincodes.filter((value) => value.cityId === address.cityId),
          )}
          value={address.pincodeId}
          onValueChange={(pincodeId, option) =>
            onChange({
              pincodeId,
              postalCode: option?.label ?? address.postalCode,
            })
          }
        />
      </UpsertFormField>
    </div>
  );
}
