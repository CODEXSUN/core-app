import { useState, type ReactNode } from "react";
import { Input } from "@workspace/ui";
import {
  UpsertForm,
  UpsertFormSection,
  UpsertFormField,
  UpsertFormValidationSummary,
} from "@workspace/ui/blocks/upsert-form";
import type { AppRecord } from "./page";

type Props = {
  id: string;
  record?: AppRecord;
  saving: boolean;
  onSavingChange: (saving: boolean) => void;
  onSave: (values: AppRecord) => Promise<void>;
  aside?: ReactNode;
  additionalFields?: ReactNode;
};

// Parent MainLayout header supplies UpsertFormSave with matching formId/saving.
// Remount with key={record?.id ?? 'new'} when switching records.
export function RecordForm({
  id,
  record,
  saving,
  onSavingChange,
  onSave,
  aside,
  additionalFields,
}: Props) {
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [error, setError] = useState("");
  const [status, setStatus] = useState("");
  return (
    <>
      <UpsertFormValidationSummary errors={errors} idPrefix={id} />
      <UpsertForm
        id={id}
        noValidate
        saving={saving}
        error={error}
        status={status}
        aside={aside}
        onSubmit={async (event) => {
          event.preventDefault();
          const data = new FormData(event.currentTarget);
          const values = {
            id: record?.id ?? "",
            name: String(data.get("name") ?? "").trim(),
            status: String(data.get("status") ?? "").trim(),
          };
          const next: Record<string, string> = {};
          if (!values.name) next.name = "Enter a name.";
          if (!values.status) next.status = "Enter a status.";
          setErrors(next);
          setError("");
          setStatus("");
          if (Object.keys(next).length) {
            document.getElementById(`${id}-${Object.keys(next)[0]}`)?.focus();
            return;
          }
          onSavingChange(true);
          try {
            await onSave(values);
            setStatus(record ? "Record updated." : "Record created.");
          } catch (cause) {
            setError(
              cause instanceof Error
                ? cause.message
                : "Unable to save. Try again.",
            );
          } finally {
            onSavingChange(false);
          }
        }}
      >
        <UpsertFormSection label="Details">
          <UpsertFormField
            idPrefix={id}
            name="name"
            label="Name"
            helper="Enter the record name."
            error={errors.name}
            required
          >
            <Input name="name" defaultValue={record?.name ?? ""} />
          </UpsertFormField>
        </UpsertFormSection>
        <UpsertFormSection label="Additional details">
          <UpsertFormField
            idPrefix={id}
            name="status"
            label="Status"
            helper="Use a status supported by this app."
            error={errors.status}
            required
          >
            <Input name="status" defaultValue={record?.status ?? ""} />
          </UpsertFormField>
          {additionalFields}
        </UpsertFormSection>
      </UpsertForm>
    </>
  );
}
