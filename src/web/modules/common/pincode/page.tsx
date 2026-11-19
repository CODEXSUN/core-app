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
import type { Pincode } from "../../../../../contracts/pincode";
import { getPincode, savePincode } from "./services";
import {useRemoteModuleList} from '../../shared/use-remote-module-list';
import { PincodeForm } from "./form";
import { PincodeShow } from "./show";
type PincodeListRow=Pick<Pincode,'public_id'|'active'|'name'|'cityName'|'area'|'sortOrder'>;
const columns: MasterListColumn<PincodeListRow>[] = [
  { id: "name", label: "Name", value: (record) => record.name },
  { id: "cityId", label: "City", value: (record) => record.cityName },
  { id: "area", label: "Area", value: (record) => record.area },
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
export default function PincodePage({
  onHeaderActionsChange,
  canWrite,
}: {
  onHeaderActionsChange: (actions: ReactNode) => void;
  canWrite: boolean;
}) {
  const { path, navigate } = useNavigation();
  const suffix = path.slice("/pincodes".length);
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
  const list=useRemoteModuleList<PincodeListRow>('pincodes',kind==='list');
  const [record, setRecord] = useState<Pincode>();
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
    const request = getPincode(publicId!, controller.signal).then((value) => {
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
      <Button onClick={() => navigate("/pincodes/new")}>New</Button>
    ) : null;
    onHeaderActionsChange(
      kind === "list" ? (
        newAction
      ) : kind === "show" ? (
        <div className="flex items-center gap-2">
          <Button variant="outline" onClick={() => navigate("/pincodes")}>
            Back to list
          </Button>
          {newAction}
          {canWrite && (
            <Button
              disabled={!ready}
              onClick={() => navigate("/pincodes/" + publicId + "/edit")}
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
              navigate(kind === "edit" ? "/pincodes/" + publicId : "/pincodes")
            }
          >
            Cancel
          </Button>
          <UpsertFormSave
            formId="pincode-form"
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
      <PincodeForm
        key={publicId ?? "new"}
        id="pincode-form"
        record={kind === "edit" ? record : undefined}
        saving={saving}
        onSavingChange={setSaving}
        onSave={async (values) => {
          const saved = await savePincode(
            values,
            kind === "edit" ? publicId : undefined,
          );
          navigate("/pincodes/" + saved.public_id, true);
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
      <PincodeShow record={record} />
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
      label="Pincodes"
      data={list.rows}
      remote={list.remote}
      columns={columns}
      getRowId={(value) => value.public_id}
      loading={list.loading}
      error={list.error || undefined}
      onRetry={list.retry}
      onOpen={(value) => navigate("/pincodes/" + value.public_id)}
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
                  navigate("/pincodes/" + value.public_id + "/edit"),
              },
            ]
          : []
      }
    />
  );
}
