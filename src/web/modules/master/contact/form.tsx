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
  contactValuesSchema,
  type Contact,
  type ContactValues,
} from "../../../../../contracts/contact";
import { useNavigation } from "../../../navigation";
import {loadContactTypeReferencePage,getContactTypeReference} from "../../common/contact-type";
import {loadContactGroupReferencePage,getContactGroupReference} from "../../common/contact-group";
import { PartyContactFields } from "../../shared/party-fields";
import { PartyBusinessFields } from "../../shared/party-business-fields";
type Props = {
  id: string;
  record?: Contact;
  saving: boolean;
  onSavingChange: (saving: boolean) => void;
  onSave: (values: ContactValues) => Promise<void>;
};
export function ContactForm({
  id,
  record,
  saving,
  onSavingChange,
  onSave,
}: Props) {
  const defaults: ContactValues = {
    name: "",
    code: "",
    legalName: "",
    role: "customer",
    typeId: "",
    groupId: "",
    gstin: "",
    pan: "",
    website: "",
    description: "",
    msmeNo: "",
    msmeCategory: "",
    tanNo: "",
    tdsAvailable: false,
    tcsAvailable: false,
    creditLimit: "0.0000",
    emails: [],
    phones: [],
    addresses: [],
    bankAccounts: [],
    socialLinks: [],
    active: true,
  };
  const initial = useRef<ContactValues>(
    record
      ? contactValuesSchema.parse(
          Object.fromEntries(
            Object.keys(defaults).map((key) => [
              key,
              record[key as keyof Contact],
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
          const parsed = contactValuesSchema.safeParse(values);
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
            name="role"
            label="Role"
            helper="Enter role."
            error={errors.role}
          >
            <FormSelect
              ariaLabel="Role"
              value={values.role}
              options={[
                { value: "customer", label: "customer" },
                { value: "supplier", label: "supplier" },
                { value: "both", label: "both" },
                { value: "other", label: "other" },
              ]}
              onValueChange={(value) =>
                setValues((previous) => ({
                  ...previous,
                  role: value as ContactValues["role"],
                }))
              }
            />
          </UpsertFormField>
          <UpsertFormField
            idPrefix={id}
            name="typeId"
            label="Contact type"
            helper="Choose an authorized record."
            error={errors.typeId}
          >
            <ReferencePicker
              ariaLabel="Contact type"
              value={values.typeId}
              loadPage={loadContactTypeReferencePage}
              loadSelected={getContactTypeReference}
              onValueChange={(value)=>{setValues(previous=>({...previous,typeId:value}));setErrors(previous=>{const next={...previous};delete next.typeId;return next;});setError('');}}
            />
          </UpsertFormField>
          <UpsertFormField
            idPrefix={id}
            name="groupId"
            label="Contact group"
            helper="Choose an authorized record."
            error={errors.groupId}
          >
            <ReferencePicker
              ariaLabel="Contact group"
              value={values.groupId}
              loadPage={loadContactGroupReferencePage}
              loadSelected={getContactGroupReference}
              onValueChange={(value)=>{setValues(previous=>({...previous,groupId:value}));setErrors(previous=>{const next={...previous};delete next.groupId;return next;});setError('');}}
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
            name="creditLimit"
            label="Credit limit"
            helper="Use up to four decimal places."
            error={errors.creditLimit}
          >
            <Input
              inputMode="decimal"
              value={values.creditLimit}
              onChange={(event) =>
                setValues((previous) => ({
                  ...previous,
                  creditLimit: event.target.value,
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
