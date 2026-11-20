import {DeleteMaster} from "../../shared/delete-master";
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
import type { WorkOrderType } from "../../../../../contracts/work-order-type";
import { getWorkOrderType, saveWorkOrderType } from "./services";
import {useRemoteModuleList} from '../../shared/use-remote-module-list';
import { WorkOrderTypeForm } from "./form";
import { WorkOrderTypeShow } from "./show";
type WorkOrderTypeListRow=Pick<WorkOrderType,'public_id'|'active'|'name'|'sortOrder'>;
const columns: MasterListColumn<WorkOrderTypeListRow>[] = [
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
export default function WorkOrderTypePage({
  onHeaderActionsChange,
  canWrite,
  canDelete = false,
}: {
  onHeaderActionsChange: (actions: ReactNode) => void;
  canWrite: boolean;
  canDelete?: boolean;
}) {
  const { path, navigate } = useNavigation();
  const suffix = path.slice("/work-order-types".length);
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
  const list=useRemoteModuleList<WorkOrderTypeListRow>('work-order-types',kind==='list');
  const [record, setRecord] = useState<WorkOrderType>();
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
    const request = getWorkOrderType(publicId!, controller.signal).then((value) => {
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
      <Button onClick={() => navigate("/work-order-types/new")}>New</Button>
    ) : null;
    onHeaderActionsChange(
      kind === "list" ? (
        newAction
      ) : kind === "show" ? (
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            onClick={() => navigate("/work-order-types")}
          >
            Back to list
          </Button>
          {newAction}
          {canDelete && ready && publicId && <DeleteMaster collection="work-order-types" publicId={publicId} onDeleted={() => navigate("/work-order-types",true)}/>}
          {canWrite && (
            <Button
              disabled={!ready}
              onClick={() =>
                navigate("/work-order-types/" + publicId + "/edit")
              }
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
                  ? "/work-order-types/" + publicId
                  : "/work-order-types",
              )
            }
          >
            Cancel
          </Button>
          <UpsertFormSave
            formId="work-order-type-form"
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
    canDelete,
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
      <WorkOrderTypeForm
        key={publicId ?? "new"}
        id="work-order-type-form"
        record={kind === "edit" ? record : undefined}
        saving={saving}
        onSavingChange={setSaving}
        onSave={async (values) => {
          const saved = await saveWorkOrderType(
            values,
            kind === "edit" ? publicId : undefined,
          );
          navigate("/work-order-types/" + saved.public_id, true);
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
      <WorkOrderTypeShow record={record} />
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
      label="Work Order Types"
      data={list.rows}
      remote={list.remote}
      columns={columns}
      getRowId={(value) => value.public_id}
      loading={list.loading}
      error={list.error || undefined}
      onRetry={list.retry}
      onOpen={(value) => navigate("/work-order-types/" + value.public_id)}
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
                  navigate("/work-order-types/" + value.public_id + "/edit"),
              },
            ]
          : []
      }
    />
  );
}
