import { useState } from "react";
import {
  FormLookup,
  type FormLookupOption,
} from "@workspace/ui/blocks/form-controls/lookup";
import { UpsertFormField } from "@workspace/ui/blocks/upsert-form";

export function LookupExample({
  options,
  createCustomer,
}: {
  options: FormLookupOption[];
  createCustomer: (name: string) => Promise<FormLookupOption>;
}) {
  const [customer, setCustomer] = useState("");
  return (
    <UpsertFormField
      name="customer"
      label="Customer"
      required
      helper="Search existing customers, or type a new name and choose + Create new."
    >
      <FormLookup
        ariaLabel="Customer"
        value={customer}
        onValueChange={setCustomer}
        options={options}
        placeholder="Search or enter customer"
        showAllOptionsOnFocus
        createMode="inline"
        createLabel="Create new"
        onCreate={createCustomer}
        allowTextValue={true}
        required
      />
      <input type="hidden" name="customer" value={customer} />
    </UpsertFormField>
  );
}
// createCustomer must return the saved { value, label } after the app API succeeds.
// Set allowTextValue=false to require an existing/created option ID.
// Creation is opt-in and belongs only to Lookup, never Select.
// Defaults: disabled=false, clearable=true, loading=false, createMode="none".
// options support description/meta, leadingIcon and swatchClassName.
// Use onTextChange for app-owned remote search; loading/emptyLabel describe it.
// No remote fetch or server persistence is provided by this block.
