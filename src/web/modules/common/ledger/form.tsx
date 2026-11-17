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
  ledgerValuesSchema,
  type Ledger,
  type LedgerValues,
} from "../../../../../contracts/ledger";
import { useNavigation } from "../../../navigation";
import { loadLedgerGroup } from "../../common/ledger-group";

type Props = {
  id: string;
  record?: Ledger;
  saving: boolean;
  onSavingChange: (saving: boolean) => void;
  onSave: (values: LedgerValues) => Promise<void>;
};
export function LedgerForm({
  id,
  record,
  saving,
  onSavingChange,
  onSave,
}: Props) {
  const defaults: LedgerValues = {
    name: "",
    ledgerGroupId: "",
    sortOrder: 0,
    active: true,
  };
  const initial = useRef<LedgerValues>(
    record
      ? ledgerValuesSchema.parse(
          Object.fromEntries(
            Object.keys(defaults).map((key) => [
              key,
              record[key as keyof Ledger],
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
    Promise.all([loadLedgerGroup()])
      .then(([ledgerGroupIdRecords]) => {
        if (active)
          setLookups({
            ledgerGroupId: ledgerGroupIdRecords
              .filter(
                (record) =>
                  record.active ||
                  record.public_id === initial.current.ledgerGroupId,
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
          const parsed = ledgerValuesSchema.safeParse(values);
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
            name="ledgerGroupId"
            label="Ledger group"
            helper="Choose an authorized record."
            error={errors.ledgerGroupId}
            required
          >
            <FormLookup
              ariaLabel="Ledger group"
              value={values.ledgerGroupId}
              options={lookups.ledgerGroupId ?? []}
              allowTextValue={false}
              onValueChange={(value) =>
                setValues((previous) => ({ ...previous, ledgerGroupId: value }))
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
