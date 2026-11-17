import { Button, Input, Switch } from "@workspace/ui";
import {
  UpsertFormField,
  UpsertFormSection,
} from "@workspace/ui/blocks/upsert-form";
import { FormSelect } from "@workspace/ui/blocks/form-controls/select";
import type {
  Address,
  PartyEmail,
  PartyPhone,
} from "../../../../contracts/party";
import { AddressReferences } from "./address-references";

type PartyFields = {
  emails: PartyEmail[];
  phones: PartyPhone[];
  addresses: Address[];
};
export function PartyContactFields({
  id,
  value,
  onChange,
  errors,
}: {
  id: string;
  value: PartyFields;
  onChange: (patch: Partial<PartyFields>) => void;
  errors: Record<string, string>;
}) {
  return (
    <>
      <UpsertFormSection label="Email addresses">
        {errors.emails && (
          <p role="alert" className="text-sm text-destructive">
            {errors.emails}
          </p>
        )}
        {value.emails.map((email, index) => (
          <div key={index} className="space-y-3">
            <UpsertFormField
              idPrefix={id}
              name={"email-" + index}
              label={"Email " + (index + 1)}
              helper="Use a valid email address."
            >
              <Input
                type="email"
                value={email.email}
                onChange={(event) =>
                  onChange({
                    emails: value.emails.map((item, i) =>
                      i === index
                        ? { ...item, email: event.target.value }
                        : item,
                    ),
                  })
                }
              />
            </UpsertFormField>
            <div className="flex items-center gap-3">
              <Switch
                aria-label={"Primary email " + (index + 1)}
                checked={email.isPrimary}
                onCheckedChange={(checked) =>
                  onChange({
                    emails: value.emails.map((item, i) => ({
                      ...item,
                      isPrimary: i === index ? checked : false,
                    })),
                  })
                }
              />
              <span>Primary email</span>
              <Button
                type="button"
                variant="outline"
                onClick={() =>
                  onChange({
                    emails: value.emails.filter((_, i) => i !== index),
                  })
                }
              >
                Remove email {index + 1}
              </Button>
            </div>
          </div>
        ))}
        <Button
          type="button"
          variant="outline"
          disabled={value.emails.length >= 20}
          onClick={() =>
            onChange({
              emails: [
                ...value.emails,
                { email: "", label: "Work", isPrimary: !value.emails.length },
              ],
            })
          }
        >
          Add email
        </Button>
      </UpsertFormSection>
      <UpsertFormSection label="Phone numbers">
        {errors.phones && (
          <p role="alert" className="text-sm text-destructive">
            {errors.phones}
          </p>
        )}
        {value.phones.map((phone, index) => (
          <div key={index} className="space-y-3">
            <UpsertFormField
              idPrefix={id}
              name={"phone-" + index}
              label={"Phone " + (index + 1)}
              helper="Include the country code where needed."
            >
              <Input
                type="tel"
                value={phone.phone}
                onChange={(event) =>
                  onChange({
                    phones: value.phones.map((item, i) =>
                      i === index
                        ? { ...item, phone: event.target.value }
                        : item,
                    ),
                  })
                }
              />
            </UpsertFormField>
            <div className="flex items-center gap-3">
              <Switch
                aria-label={"Primary phone " + (index + 1)}
                checked={phone.isPrimary}
                onCheckedChange={(checked) =>
                  onChange({
                    phones: value.phones.map((item, i) => ({
                      ...item,
                      isPrimary: i === index ? checked : false,
                    })),
                  })
                }
              />
              <span>Primary phone</span>
              <Button
                type="button"
                variant="outline"
                onClick={() =>
                  onChange({
                    phones: value.phones.filter((_, i) => i !== index),
                  })
                }
              >
                Remove phone {index + 1}
              </Button>
            </div>
          </div>
        ))}
        <Button
          type="button"
          variant="outline"
          disabled={value.phones.length >= 20}
          onClick={() =>
            onChange({
              phones: [
                ...value.phones,
                { phone: "", label: "Work", isPrimary: !value.phones.length },
              ],
            })
          }
        >
          Add phone
        </Button>
      </UpsertFormSection>
      <UpsertFormSection label="Addresses">
        {errors.addresses && (
          <p role="alert" className="text-sm text-destructive">
            {errors.addresses}
          </p>
        )}
        {value.addresses.map((address, index) => {
          const update = (patch: Partial<Address>) =>
            onChange({
              addresses: value.addresses.map((item, i) =>
                i === index ? { ...item, ...patch } : item,
              ),
            });
          return (
            <div key={index} className="space-y-3">
              <AddressReferences
                id={id}
                index={index}
                address={address}
                onChange={update}
              />
              <UpsertFormField
                idPrefix={id}
                name={"address-type-" + index}
                label={"Address " + (index + 1) + " type"}
                helper="Choose how this address is used."
              >
                <FormSelect
                  ariaLabel={"Address " + (index + 1) + " type"}
                  value={address.label}
                  onValueChange={(label) =>
                    update({ label: label as Address["label"] })
                  }
                  options={["billing", "shipping", "registered", "other"].map(
                    (value) => ({ value, label: value }),
                  )}
                />
              </UpsertFormField>
              {(
                [
                  "addressLine1",
                  "addressLine2",
                  "city",
                  "state",
                  "postalCode",
                  "country",
                ] as const
              ).map((field) => (
                <UpsertFormField
                  key={field}
                  idPrefix={id}
                  name={"address-" + index + "-" + field}
                  label={
                    {
                      addressLine1: "Address line 1",
                      addressLine2: "Address line 2",
                      city: "City",
                      state: "State",
                      postalCode: "Postal code",
                      country: "Country",
                    }[field]
                  }
                  helper={
                    field === "country"
                      ? "Enter the country name."
                      : "Enter the address detail."
                  }
                  required={field === "addressLine1" || field === "country"}
                >
                  <Input
                    value={address[field]}
                    onChange={(event) =>
                      update({ [field]: event.target.value })
                    }
                  />
                </UpsertFormField>
              ))}
              <div className="flex items-center gap-3">
                <Switch
                  aria-label={"Default address " + (index + 1)}
                  checked={address.isDefault}
                  onCheckedChange={(checked) =>
                    onChange({
                      addresses: value.addresses.map((item, i) => ({
                        ...item,
                        isDefault: i === index ? checked : false,
                      })),
                    })
                  }
                />
                <span>Default address</span>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() =>
                    onChange({
                      addresses: value.addresses.filter((_, i) => i !== index),
                    })
                  }
                >
                  Remove address {index + 1}
                </Button>
              </div>
            </div>
          );
        })}
        <Button
          type="button"
          variant="outline"
          disabled={value.addresses.length >= 20}
          onClick={() =>
            onChange({
              addresses: [
                ...value.addresses,
                {
                  addressTypeId: "",
                  countryId: "",
                  stateId: "",
                  districtId: "",
                  cityId: "",
                  pincodeId: "",
                  label: "billing",
                  addressLine1: "",
                  addressLine2: "",
                  city: "",
                  state: "",
                  postalCode: "",
                  country: "",
                  isDefault: !value.addresses.length,
                },
              ],
            })
          }
        >
          Add address
        </Button>
      </UpsertFormSection>
    </>
  );
}
