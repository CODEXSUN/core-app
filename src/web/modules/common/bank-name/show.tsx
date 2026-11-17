import { RecordDetailV1 } from "@workspace/ui/blocks/record-detail-v1";
import { MasterListStatus } from "@workspace/ui/blocks/data-table";
import type { BankName } from "../../../../../contracts/bank-name";
export function BankNameShow({ record }: { record: BankName }) {
  return (
    <RecordDetailV1
      title={record.name}
      description={record.public_id}
      status={
        <MasterListStatus tone={record.active ? "success" : "neutral"}>
          {record.active ? "Active" : "Inactive"}
        </MasterListStatus>
      }
      sections={[
        {
          id: "details",
          title: "Details",
          fields: [
            { id: "sortOrder", label: "Sort order", value: record.sortOrder },
          ],
        },
        {
          id: "audit",
          title: "Record history",
          fields: [
            {
              id: "created",
              label: "Created",
              value: new Date(record.created_at).toLocaleString(),
            },
            { id: "creator", label: "Created by", value: record.created_by },
            {
              id: "updated",
              label: "Updated",
              value: new Date(record.updated_at).toLocaleString(),
            },
            { id: "updater", label: "Updated by", value: record.updated_by },
          ],
        },
      ]}
    />
  );
}
