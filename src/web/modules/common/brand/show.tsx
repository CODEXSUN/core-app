import { RecordDetailV1 } from "@workspace/ui/blocks/record-detail-v1";
import { MasterListStatus } from "@workspace/ui/blocks/data-table";
import type { Brand } from "../../../../../contracts/brand";
export function BrandShow({ record }: { record: Brand }) {
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
            { id: "logoUrl", label: "Logo URL", value: record.logoUrl },
            { id: "logoAlt", label: "Logo description", value: record.logoAlt },
            {
              id: "showOnStorefront",
              label: "Show on storefront",
              value: record.showOnStorefront ? "Yes" : "No",
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
