import { useState } from "react";
import { FormSelect } from "@workspace/ui/blocks/form-controls/select";
import { UpsertFormField } from "@workspace/ui/blocks/upsert-form";

const priorities = [
  { value: "low", label: "Low", swatchClassName: "bg-sky-500" },
  { value: "normal", label: "Normal", swatchClassName: "bg-teal-500" },
  { value: "high", label: "High", swatchClassName: "bg-orange-500" },
  { value: "urgent", label: "Urgent", swatchClassName: "bg-rose-500" },
];
export function SelectExample() {
  const [priority, setPriority] = useState("normal");
  return (
    <UpsertFormField
      name="priority"
      label="Priority"
      helper="Choose one existing priority."
    >
      <FormSelect
        name="priority"
        ariaLabel="Priority"
        value={priority}
        onValueChange={setPriority}
        options={priorities}
        required
      />
    </UpsertFormField>
  );
}
// Fixed options only: no Create action or onCreate prop.
// Required: value, onValueChange, options. Optional: name, ariaLabel,
// disabled=false, required=false and placeholder="Select".
// name/required are forwarded to Radix Select for native form submission.
