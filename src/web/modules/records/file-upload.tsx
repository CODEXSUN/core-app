import {
  FileUpload,
  type FileUploadProps,
} from "@workspace/ui/blocks/file-upload";

export function RecordFileUpload(
  props: Pick<FileUploadProps, "onUpload" | "onFilesChange" | "disabled">,
) {
  return (
    <FileUpload
      {...props}
      label="Attachments"
      accept="image/png,image/jpeg,application/pdf"
      maxFiles={5}
      maxSizeBytes={5 * 1024 * 1024}
    />
  );
}
// Supply an authorized app uploader that resolves {id} after storage confirms success.
// Forward signal for cancellation, report actual progress, and persist result IDs with the record.
// Client checks are feedback only; server validates content, limits and actor/tenant scope.
// Retry must be idempotent; removing an item does not delete persisted storage.
// Derive editor dirty/busy state from onFilesChange when pending uploads should block leaving/saving.
