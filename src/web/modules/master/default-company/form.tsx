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
  defaultCompanyValuesSchema,
  type DefaultCompany,
  type DefaultCompanyValues,
} from "../../../../../contracts/default-company";
import { useNavigation } from "../../../navigation";
import { loadCompany } from "../../master/company";
import { loadFinancialYear } from "../../master/financial-year";

type Props = {
  id: string;
  record?: DefaultCompany;
  saving: boolean;
  onSavingChange: (saving: boolean) => void;
  onSave: (values: DefaultCompanyValues) => Promise<void>;
};
export function DefaultCompanyForm({
  id,
  record,
  saving,
  onSavingChange,
  onSave,
}: Props) {
  const defaults: DefaultCompanyValues = {
    name: "",
    companyId: "",
    financialYearId: "",
    landingApp: "application",
    active: true,
  };
  const initial = useRef<DefaultCompanyValues>(
    record
      ? defaultCompanyValuesSchema.parse(
          Object.fromEntries(
            Object.keys(defaults).map((key) => [
              key,
              record[key as keyof DefaultCompany],
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
    Promise.all([loadCompany(), loadFinancialYear()])
      .then(([companyIdRecords, financialYearIdRecords]) => {
        if (active)
          setLookups({
            companyId: companyIdRecords
              .filter(
                (record) =>
                  record.active ||
                  record.public_id === initial.current.companyId,
              )
              .map((record) => ({
                value: record.public_id,
                label: record.name,
              })),
            financialYearId: financialYearIdRecords
              .filter(
                (record) =>
                  record.active ||
                  record.public_id === initial.current.financialYearId,
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
          const parsed = defaultCompanyValuesSchema.safeParse(values);
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
            name="companyId"
            label="Company"
            helper="Choose an authorized record."
            error={errors.companyId}
            required
          >
            <FormLookup
              ariaLabel="Company"
              value={values.companyId}
              options={lookups.companyId ?? []}
              allowTextValue={false}
              onValueChange={(value) =>
                setValues((previous) => ({ ...previous, companyId: value }))
              }
            />
          </UpsertFormField>
          <UpsertFormField
            idPrefix={id}
            name="financialYearId"
            label="Financial year"
            helper="Choose an authorized record."
            error={errors.financialYearId}
            required
          >
            <FormLookup
              ariaLabel="Financial year"
              value={values.financialYearId}
              options={lookups.financialYearId ?? []}
              allowTextValue={false}
              onValueChange={(value) =>
                setValues((previous) => ({
                  ...previous,
                  financialYearId: value,
                }))
              }
            />
          </UpsertFormField>
          <UpsertFormField
            idPrefix={id}
            name="landingApp"
            label="Landing app"
            helper="Enter landing app."
            error={errors.landingApp}
          >
            <FormSelect
              ariaLabel="Landing app"
              value={values.landingApp}
              options={[
                { value: "application", label: "application" },
                { value: "billing", label: "billing" },
                { value: "crm", label: "crm" },
                { value: "mail", label: "mail" },
                { value: "task-manager", label: "task-manager" },
                { value: "qcafe", label: "qcafe" },
                { value: "hrms", label: "hrms" },
                { value: "docs", label: "docs" },
                { value: "himsx", label: "himsx" },
                { value: "codexsun", label: "codexsun" },
                { value: "sites", label: "sites" },
              ]}
              onValueChange={(value) =>
                setValues((previous) => ({
                  ...previous,
                  landingApp: value as DefaultCompanyValues["landingApp"],
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
