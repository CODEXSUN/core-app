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
  stateValuesSchema,
  type State,
  type StateValues,
} from "../../../../../contracts/state";
import { useNavigation } from "../../../navigation";
import {loadCountryReferencePage,getCountryReference} from "../../common/country";

type Props = {
  id: string;
  record?: State;
  saving: boolean;
  onSavingChange: (saving: boolean) => void;
  onSave: (values: StateValues) => Promise<void>;
};
export function StateForm({
  id,
  record,
  saving,
  onSavingChange,
  onSave,
}: Props) {
  const defaults: StateValues = {
    name: "",
    countryId: "",
    code: "",
    sortOrder: 0,
    active: true,
  };
  const initial = useRef<StateValues>(
    record
      ? stateValuesSchema.parse(
          Object.fromEntries(
            Object.keys(defaults).map((key) => [
              key,
              record[key as keyof State],
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
          const parsed = stateValuesSchema.safeParse(values);
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
            name="countryId"
            label="Country"
            helper="Choose an authorized record."
            error={errors.countryId}
            required
          >
            <ReferencePicker
              ariaLabel="Country"
              value={values.countryId}
              loadPage={loadCountryReferencePage}
              loadSelected={getCountryReference}
              onValueChange={(value)=>{setValues(previous=>({...previous,countryId:value}));setErrors(previous=>{const next={...previous};delete next.countryId;return next;});setError('');}}
            />
          </UpsertFormField>
          <UpsertFormField
            idPrefix={id}
            name="code"
            label="State code"
            helper="Enter state code."
            error={errors.code}
            required
          >
            <Input
              value={values.code}
              onChange={(event) =>
                setValues((previous) => ({
                  ...previous,
                  code: event.target.value,
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
