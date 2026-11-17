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
  companyValuesSchema,
  type Company,
  type CompanyValues,
} from "../../../../../contracts/company";
import { useNavigation } from "../../../navigation";

import { PartyContactFields } from "../../shared/party-fields";
import { PartyBusinessFields } from "../../shared/party-business-fields";
type Props = {
  id: string;
  record?: Company;
  saving: boolean;
  onSavingChange: (saving: boolean) => void;
  onSave: (values: CompanyValues) => Promise<void>;
};
export function CompanyForm({
  id,
  record,
  saving,
  onSavingChange,
  onSave,
}: Props) {
  const defaults: CompanyValues = {
    name: "",
    code: "",
    legalName: "",
    gstin: "",
    pan: "",
    website: "",
    description: "",
    msmeNo: "",
    msmeCategory: "",
    tanNo: "",
    tdsAvailable: false,
    tcsAvailable: false,
    logoUrl: "",
    logoDarkUrl: "",
    faviconUrl: "",
    industryName: "",
    emails: [],
    phones: [],
    addresses: [],
    bankAccounts: [],
    socialLinks: [],
    active: true,
  };
  const initial = useRef<CompanyValues>(
    record
      ? companyValuesSchema.parse(
          Object.fromEntries(
            Object.keys(defaults).map((key) => [
              key,
              record[key as keyof Company],
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
          const parsed = companyValuesSchema.safeParse(values);
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
            name="code"
            label="Code"
            helper="Enter code."
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
            name="legalName"
            label="Legal name"
            helper="Enter legal name."
            error={errors.legalName}
          >
            <Input
              value={values.legalName}
              onChange={(event) =>
                setValues((previous) => ({
                  ...previous,
                  legalName: event.target.value,
                }))
              }
            />
          </UpsertFormField>
          <UpsertFormField
            idPrefix={id}
            name="gstin"
            label="GSTIN"
            helper="Enter gstin."
            error={errors.gstin}
          >
            <Input
              value={values.gstin}
              onChange={(event) =>
                setValues((previous) => ({
                  ...previous,
                  gstin: event.target.value,
                }))
              }
            />
          </UpsertFormField>
          <UpsertFormField
            idPrefix={id}
            name="pan"
            label="PAN"
            helper="Enter pan."
            error={errors.pan}
          >
            <Input
              value={values.pan}
              onChange={(event) =>
                setValues((previous) => ({
                  ...previous,
                  pan: event.target.value,
                }))
              }
            />
          </UpsertFormField>
          <UpsertFormField
            idPrefix={id}
            name="website"
            label="Website"
            helper="Enter website."
            error={errors.website}
          >
            <Input
              type="url"
              value={values.website}
              onChange={(event) =>
                setValues((previous) => ({
                  ...previous,
                  website: event.target.value,
                }))
              }
            />
          </UpsertFormField>
          <UpsertFormField
            idPrefix={id}
            name="description"
            label="Notes"
            helper="Enter notes."
            error={errors.description}
          >
            <Textarea
              value={values.description}
              onChange={(event) =>
                setValues((previous) => ({
                  ...previous,
                  description: event.target.value,
                }))
              }
            />
          </UpsertFormField>
          <UpsertFormField
            idPrefix={id}
            name="msmeNo"
            label="MSME number"
            helper="Enter msme number."
            error={errors.msmeNo}
          >
            <Input
              value={values.msmeNo}
              onChange={(event) =>
                setValues((previous) => ({
                  ...previous,
                  msmeNo: event.target.value,
                }))
              }
            />
          </UpsertFormField>
          <UpsertFormField
            idPrefix={id}
            name="msmeCategory"
            label="MSME category"
            helper="Enter msme category."
            error={errors.msmeCategory}
          >
            <Input
              value={values.msmeCategory}
              onChange={(event) =>
                setValues((previous) => ({
                  ...previous,
                  msmeCategory: event.target.value,
                }))
              }
            />
          </UpsertFormField>
          <UpsertFormField
            idPrefix={id}
            name="tanNo"
            label="TAN"
            helper="Enter tan."
            error={errors.tanNo}
          >
            <Input
              value={values.tanNo}
              onChange={(event) =>
                setValues((previous) => ({
                  ...previous,
                  tanNo: event.target.value,
                }))
              }
            />
          </UpsertFormField>
          <UpsertFormField
            idPrefix={id}
            name="tdsAvailable"
            label="TDS available"
            helper="Enter tds available."
            error={errors.tdsAvailable}
          >
            <Switch
              aria-label="TDS available"
              checked={values.tdsAvailable}
              onCheckedChange={(value) =>
                setValues((previous) => ({ ...previous, tdsAvailable: value }))
              }
            />
          </UpsertFormField>
          <UpsertFormField
            idPrefix={id}
            name="tcsAvailable"
            label="TCS available"
            helper="Enter tcs available."
            error={errors.tcsAvailable}
          >
            <Switch
              aria-label="TCS available"
              checked={values.tcsAvailable}
              onCheckedChange={(value) =>
                setValues((previous) => ({ ...previous, tcsAvailable: value }))
              }
            />
          </UpsertFormField>
          <UpsertFormField
            idPrefix={id}
            name="logoUrl"
            label="Logo URL"
            helper="Enter logo url."
            error={errors.logoUrl}
          >
            <Input
              type="url"
              value={values.logoUrl}
              onChange={(event) =>
                setValues((previous) => ({
                  ...previous,
                  logoUrl: event.target.value,
                }))
              }
            />
          </UpsertFormField>
          <UpsertFormField
            idPrefix={id}
            name="logoDarkUrl"
            label="Dark logo URL"
            helper="Enter dark logo url."
            error={errors.logoDarkUrl}
          >
            <Input
              type="url"
              value={values.logoDarkUrl}
              onChange={(event) =>
                setValues((previous) => ({
                  ...previous,
                  logoDarkUrl: event.target.value,
                }))
              }
            />
          </UpsertFormField>
          <UpsertFormField
            idPrefix={id}
            name="faviconUrl"
            label="Favicon URL"
            helper="Enter favicon url."
            error={errors.faviconUrl}
          >
            <Input
              type="url"
              value={values.faviconUrl}
              onChange={(event) =>
                setValues((previous) => ({
                  ...previous,
                  faviconUrl: event.target.value,
                }))
              }
            />
          </UpsertFormField>
          <UpsertFormField
            idPrefix={id}
            name="industryName"
            label="Industry"
            helper="Enter industry."
            error={errors.industryName}
          >
            <Input
              value={values.industryName}
              onChange={(event) =>
                setValues((previous) => ({
                  ...previous,
                  industryName: event.target.value,
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
        <PartyContactFields
          id={id}
          value={values}
          errors={errors}
          onChange={(patch) =>
            setValues((previous) => ({ ...previous, ...patch }))
          }
        />
        <PartyBusinessFields
          id={id}
          bankAccounts={values.bankAccounts}
          socialLinks={values.socialLinks}
          errors={errors}
          onChange={(patch) =>
            setValues((previous) => ({ ...previous, ...patch }))
          }
        />
      </UpsertForm>
    </>
  );
}
