import { RecordDetailV1 } from "@workspace/ui/blocks/record-detail-v1";
import { MasterListStatus } from "@workspace/ui/blocks/data-table";
import type { Transport } from "../../../../../contracts/transport";
export function TransportShow({ record }: { record: Transport }) {
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
            { id: "gst", label: "GSTIN", value: record.gst },
            {
              id: "vehicleNo",
              label: "Vehicle number",
              value: record.vehicleNo,
            },
            { id: "address", label: "Address", value: record.address },
            {
              id: "contactNo",
              label: "Contact number",
              value: record.contactNo,
            },
            {
              id: "contactPerson",
              label: "Contact person",
              value: record.contactPerson,
            },
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
