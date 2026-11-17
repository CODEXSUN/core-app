import { useEffect, useState, type ReactNode } from "react";
import { Button } from "@workspace/ui";
import { AsyncState } from "@workspace/ui/blocks/async-state";
import { UpsertFormSave } from "@workspace/ui/blocks/upsert-form";
import {
  MasterListV1,
  MasterListStatus,
  type MasterListColumn,
} from "@workspace/ui/blocks/data-table";
import { useNavigation } from "../../../navigation";
import type { LedgerGroup } from "../../../../../contracts/ledger-group";
import { loadLedgerGroup, getLedgerGroup, saveLedgerGroup } from "./services";
import { LedgerGroupForm } from "./form";
import { LedgerGroupShow } from "./show";
const columns: MasterListColumn<LedgerGroup>[] = [
  { id: "name", label: "Name", value: (record) => record.name },
  { id: "sortOrder", label: "Sort order", value: (record) => record.sortOrder },
  {
    id: "active",
    label: "Active",
    value: (record) => (record.active ? "Yes" : "No"),
    render: (record) => (
      <MasterListStatus tone={record.active ? "success" : "neutral"}>
        {record.active ? "Active" : "Inactive"}
      </MasterListStatus>
    ),
  },
];
export default function LedgerGroupPage({
  onHeaderActionsChange,
  canWrite,
}: {
  onHeaderActionsChange: (actions: ReactNode) => void;
  canWrite: boolean;
}) {
  const { path, navigate } = useNavigation();
  const suffix = path.slice("/ledger-groups".length);
  const match = suffix.match(/^\/([a-z0-9]{8})(\/edit)?$/);
  const kind =
    suffix === "" || suffix === "/"
      ? "list"
      : suffix === "/new"
        ? "new"
        : match
          ? match[2]
            ? "edit"
            : "show"
          : "missing";
  const publicId = match?.[1];
  const [records, setRecords] = useState<LedgerGroup[]>([]);
  const [record, setRecord] = useState<LedgerGroup>();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);
  const [attempt, setAttempt] = useState(0);
  useEffect(() => {
    if (kind === "new" || kind === "missing") return;
    const controller = new AbortController();
    setLoading(true);
    setError("");
    setRecord(undefined);
    const request =
      kind === "list"
        ? loadLedgerGroup(controller.signal).then((value) => {
            if (!controller.signal.aborted) setRecords(value);
          })
        : getLedgerGroup(publicId!, controller.signal).then((value) => {
            if (!controller.signal.aborted) setRecord(value);
          });
    request
      .catch((cause) => {
        if (!controller.signal.aborted) setError(cause.message);
      })
      .finally(() => {
        if (!controller.signal.aborted) setLoading(false);
      });
    return () => controller.abort();
  }, [kind, publicId, attempt]);
  const ready =
    kind === "new" ||
    Boolean(record?.public_id === publicId && !loading && !error);
  useEffect(() => {
    const newAction = canWrite ? (
      <Button onClick={() => navigate("/ledger-groups/new")}>New</Button>
    ) : null;
    onHeaderActionsChange(
      kind === "list" ? (
        newAction
      ) : kind === "show" ? (
        <div className="flex items-center gap-2">
          <Button variant="outline" onClick={() => navigate("/ledger-groups")}>
            Back to list
          </Button>
          {newAction}
          {canWrite && (
            <Button
              disabled={!ready}
              onClick={() => navigate("/ledger-groups/" + publicId + "/edit")}
            >
              Edit
            </Button>
          )}
        </div>
      ) : (kind === "new" || kind === "edit") && canWrite ? (
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            disabled={saving}
            onClick={() =>
              navigate(
                kind === "edit"
                  ? "/ledger-groups/" + publicId
                  : "/ledger-groups",
              )
            }
          >
            Cancel
          </Button>
          <UpsertFormSave
            formId="ledger-group-form"
            saving={saving}
            disabled={!ready}
          />
        </div>
      ) : null,
    );
    return () => onHeaderActionsChange(null);
  }, [
    kind,
    publicId,
    ready,
    saving,
    canWrite,
    navigate,
    onHeaderActionsChange,
  ]);
  if (kind === "missing") return <p role="alert">Record not found.</p>;
  if ((kind === "new" || kind === "edit") && !canWrite)
    return (
      <p role="alert">You do not have permission to edit these records.</p>
    );
  if (kind === "new" || kind === "edit")
    return ready ? (
      <LedgerGroupForm
        key={publicId ?? "new"}
        id="ledger-group-form"
        record={kind === "edit" ? record : undefined}
        saving={saving}
        onSavingChange={setSaving}
        onSave={async (values) => {
          const saved = await saveLedgerGroup(
            values,
            kind === "edit" ? publicId : undefined,
          );
          navigate("/ledger-groups/" + saved.public_id, true);
        }}
      />
    ) : (
      <AsyncState
        loading={loading}
        error={error || undefined}
        onRetry={() => setAttempt((value) => value + 1)}
      >
        {null}
      </AsyncState>
    );
  if (kind === "show")
    return ready && record ? (
      <LedgerGroupShow record={record} />
    ) : (
      <AsyncState
        loading={loading}
        error={error || undefined}
        onRetry={() => setAttempt((value) => value + 1)}
      >
        {null}
      </AsyncState>
    );
  return (
    <MasterListV1
      label="Ledger Groups"
      data={records}
      columns={columns}
      getRowId={(value) => value.public_id}
      loading={loading}
      error={error || undefined}
      onRetry={() => setAttempt((value) => value + 1)}
      onOpen={(value) => navigate("/ledger-groups/" + value.public_id)}
      filterOptions={[
        { id: "active", label: "Active", matches: (value) => value.active },
        {
          id: "inactive",
          label: "Inactive",
          matches: (value) => !value.active,
        },
      ]}
      actions={
        canWrite
          ? [
              {
                id: "edit",
                label: "Edit",
                onSelect: (value) =>
                  navigate("/ledger-groups/" + value.public_id + "/edit"),
              },
            ]
          : []
      }
    />
  );
}
