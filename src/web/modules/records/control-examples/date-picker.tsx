import { useState } from "react";
import { Button } from "@workspace/ui/components/button";
import { FormDatePicker } from "@workspace/ui/blocks/form-controls/date-picker";
import { UpsertFormField } from "@workspace/ui/blocks/upsert-form";

export function DatePickerExample() {
  const [date, setDate] = useState("");
  const [error, setError] = useState("");
  return (
    <>
      <UpsertFormField
        name="dueDate"
        label="Due date"
        required
        error={error}
        helper="Type DD-MM-YYYY or choose a date. Years 2000–2050."
      >
        <FormDatePicker
          ariaLabel="Due date"
          value={date}
          onValueChange={setDate}
          placeholder="Select date"
          allowManualInput
        />
        <input type="hidden" name="dueDate" value={date} />
      </UpsertFormField>
      <Button
        type="button"
        onClick={() => setError(date ? "" : "Choose a due date.")}
      >
        Check date
      </Button>
    </>
  );
}
// Controlled value: ISO yyyy-MM-dd. Manual display/input: dd-MM-yyyy.
// Defaults: allowManualInput=false, placeholder="Select date".
// Month/year lookup, previous/next and calendar selection are built in.
// The reference picker's required prop is not enforced. Validate dates in the app.
// Empty/manual-invalid text does not emit a new ISO date; validate before save.
