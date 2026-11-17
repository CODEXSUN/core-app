import { RecordDetailV1 } from "@workspace/ui/blocks/record-detail-v1";
import { MasterListStatus } from "@workspace/ui/blocks/data-table";
import type { Product } from "../../../../../contracts/product";
export function ProductShow({ record }: { record: Product }) {
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
            { id: "typeId", label: "Product type", value: record.typeName },
            {
              id: "productCategoryId",
              label: "Category",
              value: record.productCategoryName,
            },
            {
              id: "productGroupId",
              label: "Group",
              value: record.productGroupName,
            },
            { id: "hsnCodeId", label: "HSN code", value: record.hsnCodeName },
            { id: "unitId", label: "Unit", value: record.unitName },
            { id: "taxId", label: "Tax", value: record.taxName },
            { id: "brandId", label: "Brand", value: record.brandName },
            {
              id: "openingStock",
              label: "Opening quantity",
              value: record.openingStock,
            },
            {
              id: "openingRate",
              label: "Opening rate",
              value: record.openingRate,
            },
            {
              id: "description",
              label: "Description",
              value: record.description,
            },
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
