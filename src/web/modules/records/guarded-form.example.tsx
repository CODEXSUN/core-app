import { useState } from "react";
import { Button } from "@workspace/ui/components/button";
import { Input } from "@workspace/ui/components/input";
import {
  UpsertForm,
  UpsertFormField,
  UpsertFormSave,
} from "@workspace/ui/blocks/upsert-form";
import { useUnsavedChangesGuard } from "@workspace/ui/blocks/unsaved-changes-guard";

export function GuardedRecordEditor({
  id,
  initialName,
  onSave,
  onLeave,
}: {
  id: string;
  initialName: string;
  onSave: (name: string) => Promise<void>;
  onLeave: () => void;
}) {
  const [name, setName] = useState(initialName);
  const [saved, setSaved] = useState(initialName);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const guard = useUnsavedChangesGuard({ dirty: name !== saved, busy: saving });
  return (
    <>
      <UpsertForm
        id={id}
        saving={saving}
        error={error}
        onSubmit={async (event) => {
          event.preventDefault();
          if (saving) return;
          const submitted = name.trim();
          if (!submitted) {
            setError("Enter a name.");
            return;
          }
          setSaving(true);
          setError("");
          try {
            await onSave(submitted);
            setName(submitted);
            setSaved(submitted);
          } catch {
            setError("Unable to save. Your changes are still available.");
          } finally {
            setSaving(false);
          }
        }}
      >
        <UpsertFormField
          idPrefix={id}
          name="name"
          label="Name"
          helper="Enter the record name."
          required
        >
          <Input
            name="name"
            value={name}
            onChange={(event) => setName(event.target.value)}
          />
        </UpsertFormField>
        <div className="flex gap-2">
          <UpsertFormSave formId={id} saving={saving} />
          <Button
            type="button"
            variant="outline"
            disabled={saving}
            onClick={() => guard.requestNavigation(onLeave)}
          >
            Cancel
          </Button>
        </div>
      </UpsertForm>
      {guard.dialog}
    </>
  );
}
// App shell integration: put UpsertFormSave in MainLayout headerActions, removing the inline Save.
// Remount with key=record ID when changing records. Route every app-owned leave action via the guard.
// Router history/popstate requires router-specific blocking; beforeunload is native and browser-limited.
// Never mark clean until the real save succeeds. Apps handle server validation/permissions.
