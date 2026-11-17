import {
  MasterListV1,
  MasterListStatus,
  type MasterListColumn,
  type MasterListV1Props,
} from "@workspace/ui/blocks/data-table";

// Replace with the owning product's public record contract and column definitions.
export type AppRecord = { id: string; name: string; status: string };
const columns: MasterListColumn<AppRecord>[] = [
  { id: "name", label: "Name", value: (record) => record.name },
  {
    id: "status",
    label: "Status",
    value: (record) => record.status,
    render: (record) => (
      <MasterListStatus tone="neutral">{record.status}</MasterListStatus>
    ),
  },
];

// Inherit the public contract so loading/error/retry, labels, callbacks, filters,
// toolbar content and future shared options stay available without a copied API.
export type RecordsPageProps = Omit<
  MasterListV1Props<AppRecord>,
  "data" | "columns" | "label" | "getRowId"
> & {
  records: readonly AppRecord[];
  columns?: readonly MasterListColumn<AppRecord>[];
  label?: string;
  getRowId?: (record: AppRecord) => string;
};

export function RecordsPage({
  records,
  columns: recordColumns = columns,
  label = "Records",
  getRowId = (record) => record.id,
  ...options
}: RecordsPageProps) {
  // Inherit 100 rows, hidden inline filters, serial #, tooltips, menus and pagination.
  // Only override design/defaultPageSize on explicit user direction.
  return (
    <MasterListV1
      {...options}
      label={label}
      data={records}
      columns={recordColumns}
      getRowId={getRowId}
    />
  );
}
