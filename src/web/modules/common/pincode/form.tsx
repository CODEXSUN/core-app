import { useEffect, useRef, useState } from "react";
import { Input, Textarea, Switch } from "@workspace/ui";
import {
  UpsertForm,
  UpsertFormField,
  UpsertFormSection,
  UpsertFormValidationSummary,
} from "@workspace/ui/blocks/upsert-form";
import {ReferencePicker} from "../../shared/reference-picker";
import { FormSelect } from "@workspace/ui/blocks/form-controls/select";
import { FormDatePicker } from "@workspace/ui/blocks/form-controls/date-picker";
import { useUnsavedChangesGuard } from "@workspace/ui/blocks/unsaved-changes-guard";
import {
  pincodeValuesSchema,
  type Pincode,
  type PincodeValues,
} from "../../../../../contracts/pincode";
import { useNavigation } from "../../../navigation";
import {loadCityReferencePage,getCityReference} from "../../common/city";

type Props = {
  id: string;
  record?: Pincode;
  saving: boolean;
  onSavingChange: (saving: boolean) => void;
  onSave: (values: PincodeValues) => Promise<void>;
};
export function PincodeForm({
  id,
  record,
  saving,
  onSavingChange,
  onSave,
}: Props) {
  const defaults: PincodeValues = {
    name: "",
    cityId: "",
    area: "",
    sortOrder: 0,
    active: true,
  };
  const initial = useRef<PincodeValues>(
    record
      ? pincodeValuesSchema.parse(
          Object.fromEntries(
            Object.keys(defaults).map((key) => [
              key,
              record[key as keyof Pincode],
            ]),
          ),
        )
      : defaults,
  );
  const [values, setValues] = useState(initial.current);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [error, setError] = useState("");
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
        error={error}
        onSubmit={async (event) => {
          event.preventDefault();
          if (pending.current || saving) return;
          const parsed = pincodeValuesSchema.safeParse(values);
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
            name="cityId"
            label="City"
            helper="Choose an authorized record."
            error={errors.cityId}
            required
          >
            <ReferencePicker
              ariaLabel="City"
              value={values.cityId}
              loadPage={loadCityReferencePage}
              loadSelected={getCityReference}
              onValueChange={(value)=>{setValues(previous=>({...previous,cityId:value}));setErrors(previous=>{const next={...previous};delete next.cityId;return next;});setError('');}}
            />
          </UpsertFormField>
          <UpsertFormField
            idPrefix={id}
            name="area"
            label="Area"
            helper="Enter area."
            error={errors.area}
          >
            <Input
              value={values.area}
              onChange={(event) =>
                setValues((previous) => ({
                  ...previous,
                  area: event.target.value,
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
