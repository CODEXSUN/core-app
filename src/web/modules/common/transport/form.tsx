import { useEffect, useRef, useState } from "react";
import { Input, Textarea, Switch } from "@workspace/ui";
import {
  UpsertForm,
  UpsertFormField,
  UpsertFormSection,
  UpsertFormValidationSummary,
} from "@workspace/ui/blocks/upsert-form";
import { FormLookup } from "@workspace/ui/blocks/form-controls/lookup";
import { FormSelect } from "@workspace/ui/blocks/form-controls/select";
import { FormDatePicker } from "@workspace/ui/blocks/form-controls/date-picker";
import { useUnsavedChangesGuard } from "@workspace/ui/blocks/unsaved-changes-guard";
import {
  transportValuesSchema,
  type Transport,
  type TransportValues,
} from "../../../../../contracts/transport";
import { useNavigation } from "../../../navigation";

type Props = {
  id: string;
  record?: Transport;
  saving: boolean;
  onSavingChange: (saving: boolean) => void;
  onSave: (values: TransportValues) => Promise<void>;
};
export function TransportForm({
  id,
  record,
  saving,
  onSavingChange,
  onSave,
}: Props) {
  const defaults: TransportValues = {
    name: "",
    gst: "",
    vehicleNo: "",
    address: "",
    contactNo: "",
    contactPerson: "",
    sortOrder: 0,
    active: true,
  };
  const initial = useRef<TransportValues>(
    record
      ? transportValuesSchema.parse(
          Object.fromEntries(
            Object.keys(defaults).map((key) => [
              key,
              record[key as keyof Transport],
            ]),
          ),
        )
      : defaults,
  );
  const [values, setValues] = useState(initial.current);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [error, setError] = useState("");
  const [lookups, setLookups] = useState<
    Record<string, { value: string; label: string }[]>
  >({});
  const [lookupError, setLookupError] = useState("");
  const [lookupLoading, setLookupLoading] = useState(false);
  const pending = useRef(false);
  const { setGuard } = useNavigation();
  const guard = useUnsavedChangesGuard({
    dirty: JSON.stringify(values) !== JSON.stringify(initial.current),
    busy: saving,
  });
  useEffect(() => {
    setGuard(
      JSON.stringify(values) !== JSON.stringify(initial.current) || saving
        ? guard.requestNavigation
        : null,
    );
    return () => setGuard(null);
  }, [values, saving, guard.requestNavigation, setGuard]);

  return (
    <>
      {guard.dialog}
      <UpsertFormValidationSummary errors={errors} idPrefix={id} />
      <UpsertForm
        id={id}
        noValidate
        saving={saving}
        error={error || lookupError}
        onSubmit={async (event) => {
          event.preventDefault();
          if (pending.current || saving) return;
          if (lookupLoading || lookupError) {
            setError(lookupError || "Wait for reference choices to load.");
            return;
          }
          const parsed = transportValuesSchema.safeParse(values);
          setErrors({});
          setError("");
          if (!parsed.success) {
            const fields = Object.fromEntries(
              parsed.error.issues.map((issue) => [
                String(issue.path[0] ?? "name"),
                issue.message,
              ]),
            );
            setErrors(fields);
            document.getElementById(id + "-" + Object.keys(fields)[0])?.focus();
            return;
          }
          pending.current = true;
          onSavingChange(true);
          try {
            await onSave(parsed.data);
            initial.current = parsed.data;
          } catch (cause) {
            setError(
              cause instanceof Error ? cause.message : "Unable to save.",
            );
          } finally {
            pending.current = false;
            onSavingChange(false);
          }
        }}
      >
        <UpsertFormSection label="Details">
          <UpsertFormField
            idPrefix={id}
            name="name"
            label="Name"
            helper="Enter name."
            error={errors.name}
            required
          >
            <Input
              value={values.name}
              onChange={(event) =>
                setValues((previous) => ({
                  ...previous,
                  name: event.target.value,
                }))
              }
            />
          </UpsertFormField>
          <UpsertFormField
            idPrefix={id}
            name="gst"
            label="GSTIN"
            helper="Enter gstin."
            error={errors.gst}
          >
            <Input
              value={values.gst}
              onChange={(event) =>
                setValues((previous) => ({
                  ...previous,
                  gst: event.target.value,
                }))
              }
            />
          </UpsertFormField>
          <UpsertFormField
            idPrefix={id}
            name="vehicleNo"
            label="Vehicle number"
            helper="Enter vehicle number."
            error={errors.vehicleNo}
          >
            <Input
              value={values.vehicleNo}
              onChange={(event) =>
                setValues((previous) => ({
                  ...previous,
                  vehicleNo: event.target.value,
                }))
              }
            />
          </UpsertFormField>
          <UpsertFormField
            idPrefix={id}
            name="address"
            label="Address"
            helper="Enter address."
            error={errors.address}
          >
            <Input
              value={values.address}
              onChange={(event) =>
                setValues((previous) => ({
                  ...previous,
                  address: event.target.value,
                }))
              }
            />
          </UpsertFormField>
          <UpsertFormField
            idPrefix={id}
            name="contactNo"
            label="Contact number"
            helper="Enter contact number."
            error={errors.contactNo}
          >
            <Input
              value={values.contactNo}
              onChange={(event) =>
                setValues((previous) => ({
                  ...previous,
                  contactNo: event.target.value,
                }))
              }
            />
          </UpsertFormField>
          <UpsertFormField
            idPrefix={id}
            name="contactPerson"
            label="Contact person"
            helper="Enter contact person."
            error={errors.contactPerson}
          >
            <Input
              value={values.contactPerson}
              onChange={(event) =>
                setValues((previous) => ({
                  ...previous,
                  contactPerson: event.target.value,
                }))
              }
            />
          </UpsertFormField>
          <UpsertFormField
            idPrefix={id}
            name="sortOrder"
            label="Sort order"
            helper="Enter sort order."
            error={errors.sortOrder}
          >
            <Input
              type="number"
              min={0}
              step={1}
              value={values.sortOrder}
              onChange={(event) =>
                setValues((previous) => ({
                  ...previous,
                  sortOrder: Number(event.target.value),
                }))
              }
            />
          </UpsertFormField>
          <UpsertFormField
            idPrefix={id}
            name="active"
            label="Active"
            helper="Enter active."
            error={errors.active}
          >
            <Switch
              aria-label="Active"
              checked={values.active}
              onCheckedChange={(value) =>
                setValues((previous) => ({ ...previous, active: value }))
              }
            />
          </UpsertFormField>
        </UpsertFormSection>
      </UpsertForm>
    </>
  );
}
