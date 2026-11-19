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
import type { Destination } from "../../../../../contracts/destination";
import { getDestination, saveDestination } from "./services";
import {useRemoteModuleList} from '../../shared/use-remote-module-list';
import { DestinationForm } from "./form";
import { DestinationShow } from "./show";
type DestinationListRow=Pick<Destination,'public_id'|'active'|'name'|'sortOrder'>;
const columns: MasterListColumn<DestinationListRow>[] = [
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
export default function DestinationPage({
  onHeaderActionsChange,
  canWrite,
}: {
  onHeaderActionsChange: (actions: ReactNode) => void;
  canWrite: boolean;
}) {
  const { path, navigate } = useNavigation();
  const suffix = path.slice("/destinations".length);
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
  const list=useRemoteModuleList<DestinationListRow>('destinations',kind==='list');
  const [record, setRecord] = useState<Destination>();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);
  const [attempt, setAttempt] = useState(0);
  useEffect(() => {
    if (kind === "new" || kind === "missing" || kind === "list") return;
    const controller = new AbortController();
    setLoading(true);
    setError("");
    setRecord(undefined);
    const request = getDestination(publicId!, controller.signal).then((value) => {
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
      <Button onClick={() => navigate("/destinations/new")}>New</Button>
    ) : null;
    onHeaderActionsChange(
      kind === "list" ? (
        newAction
      ) : kind === "show" ? (
        <div className="flex items-center gap-2">
          <Button variant="outline" onClick={() => navigate("/destinations")}>
            Back to list
          </Button>
          {newAction}
          {canWrite && (
            <Button
              disabled={!ready}
              onClick={() => navigate("/destinations/" + publicId + "/edit")}
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
                kind === "edit" ? "/destinations/" + publicId : "/destinations",
              )
            }
          >
            Cancel
          </Button>
          <UpsertFormSave
            formId="destination-form"
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
      <DestinationForm
        key={publicId ?? "new"}
        id="destination-form"
        record={kind === "edit" ? record : undefined}
        saving={saving}
        onSavingChange={setSaving}
        onSave={async (values) => {
          const saved = await saveDestination(
            values,
            kind === "edit" ? publicId : undefined,
          );
          navigate("/destinations/" + saved.public_id, true);
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
      <DestinationShow record={record} />
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
      label="Destinations"
      data={list.rows}
      remote={list.remote}
      columns={columns}
      getRowId={(value) => value.public_id}
      loading={list.loading}
      error={list.error || undefined}
      onRetry={list.retry}
      onOpen={(value) => navigate("/destinations/" + value.public_id)}
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
                  navigate("/destinations/" + value.public_id + "/edit"),
              },
            ]
          : []
      }
    />
  );
}
