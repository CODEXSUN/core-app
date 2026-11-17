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
  districtValuesSchema,
  type District,
  type DistrictValues,
} from "../../../../../contracts/district";
import { useNavigation } from "../../../navigation";
import { loadState } from "../../common/state";

type Props = {
  id: string;
  record?: District;
  saving: boolean;
  onSavingChange: (saving: boolean) => void;
  onSave: (values: DistrictValues) => Promise<void>;
};
export function DistrictForm({
  id,
  record,
  saving,
  onSavingChange,
  onSave,
}: Props) {
  const defaults: DistrictValues = {
    name: "",
    stateId: "",
    sortOrder: 0,
    active: true,
  };
  const initial = useRef<DistrictValues>(
    record
      ? districtValuesSchema.parse(
          Object.fromEntries(
            Object.keys(defaults).map((key) => [
              key,
              record[key as keyof District],
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
  const [lookupLoading, setLookupLoading] = useState(true);
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
  useEffect(() => {
    let active = true;
    Promise.all([loadState()])
      .then(([stateIdRecords]) => {
        if (active)
          setLookups({
            stateId: stateIdRecords
              .filter(
                (record) =>
                  record.active || record.public_id === initial.current.stateId,
              )
              .map((record) => ({
                value: record.public_id,
                label: record.name,
              })),
          });
      })
      .catch(() => {
        if (active)
          setLookupError(
            "Unable to load reference choices. Check access or reload this form.",
          );
      })
      .finally(() => {
        if (active) setLookupLoading(false);
      });
    return () => {
      active = false;
    };
  }, []);
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
          const parsed = districtValuesSchema.safeParse(values);
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
            name="stateId"
            label="State"
            helper="Choose an authorized record."
            error={errors.stateId}
            required
          >
            <FormLookup
              ariaLabel="State"
              value={values.stateId}
              options={lookups.stateId ?? []}
              allowTextValue={false}
              onValueChange={(value) =>
                setValues((previous) => ({ ...previous, stateId: value }))
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
