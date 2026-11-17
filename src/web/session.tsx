import { useState } from "react";
import {
  Button,
  Input,
  Card,
  CardHeader,
  CardTitle,
  CardContent,
} from "@workspace/ui";
import {
  UpsertForm,
  UpsertFormField,
  UpsertFormSection,
  UpsertFormSave,
} from "@workspace/ui/blocks/upsert-form";

export type WorkspaceSession = {
  actorId: string;
  tenantId: string;
  permissions: string[];
};
export async function getSession(): Promise<{
  context: WorkspaceSession | null;
  localAccess: boolean;
}> {
  const response = await fetch("/api/v1/session", {
    credentials: "same-origin",
    cache: "no-store",
  });
  if (!response.ok)
    throw new Error("Workspace access is temporarily unavailable.");
  return response.json();
}
export function WorkspaceAccess({
  localAccess,
  onConnected,
}: {
  localAccess: boolean;
  onConnected: () => void;
}) {
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  async function connect(body: { local?: boolean; token?: string }) {
    if (busy) return;
    setBusy(true);
    setError("");
    try {
      const response = await fetch("/api/v1/session", {
        method: "POST",
        credentials: "same-origin",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      if (!response.ok)
        throw new Error(
          "Workspace access was not accepted. Check your access key.",
        );
      onConnected();
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Unable to connect.");
    } finally {
      setBusy(false);
    }
  }
  return (
    <div className="space-y-5">
      <Card>
        <CardHeader>
          <CardTitle>Connect to Core</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p>Manage companies, financial years and contacts in one place.</p>
          {localAccess && (
            <>
              <p className="text-sm text-muted-foreground">
                Local development access uses an isolated development workspace.
                It is unavailable on production servers.
              </p>
              <Button
                disabled={busy}
                onClick={() => void connect({ local: true })}
              >
                Open local workspace
              </Button>
            </>
          )}
        </CardContent>
      </Card>
      <UpsertForm
        id="workspace-access"
        saving={busy}
        error={error}
        onSubmit={(event) => {
          event.preventDefault();
          const data = new FormData(event.currentTarget);
          void connect({ token: String(data.get("token") ?? "") });
        }}
      >
        <UpsertFormSection label="Workspace access key">
          <UpsertFormField
            name="token"
            label="Access key"
            helper="Use a key issued by your Core administrator."
            required
          >
            <Input
              type="password"
              name="token"
              autoComplete="off"
              minLength={32}
              required
            />
          </UpsertFormField>
          <UpsertFormSave
            formId="workspace-access"
            label="Connect"
            saving={busy}
          />
        </UpsertFormSection>
      </UpsertForm>
    </div>
  );
}
