import { useRef, useState } from "react";
import {
  Button,
  AlertDialog,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogCancel,
  AlertDialogAction,
} from "@workspace/ui";
import { appFetch } from "../../platform-client";

/** Core owns the delete request and surfaces reference conflicts unchanged. */
export function DeleteMaster({
  collection,
  publicId,
  onDeleted,
}: {
  collection: string;
  publicId: string;
  onDeleted: () => void;
}) {
  const [open, setOpen] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const pending = useRef(false);

  async function remove() {
    if (pending.current) return;
    pending.current = true;
    setBusy(true);
    setError("");
    try {
      const response = await appFetch(
        "/api/v1/" + collection + "/" + encodeURIComponent(publicId),
        {
          method: "DELETE",
          credentials: "same-origin",
          cache: "no-store",
        },
      );
      const result = await response.json();
      if (!response.ok)
        throw new Error(
          result.message ?? result.error ?? "Unable to delete this record.",
        );
      setOpen(false);
      onDeleted();
    } catch (cause) {
      setError(
        cause instanceof Error
          ? cause.message
          : "Unable to delete this record.",
      );
    } finally {
      pending.current = false;
      setBusy(false);
    }
  }

  return (
    <>
      <Button
        variant="destructive"
        onClick={() => {
          setError("");
          setOpen(true);
        }}
      >
        Delete
      </Button>
      <AlertDialog
        open={open}
        onOpenChange={(value) => {
          if (!busy) setOpen(value);
        }}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete this record?</AlertDialogTitle>
            <AlertDialogDescription>
              The record will leave ordinary lists. Its identity and deletion
              history remain saved. Referenced records must be changed first.
            </AlertDialogDescription>
          </AlertDialogHeader>
          {error && <p role="alert">{error}</p>}
          <AlertDialogFooter>
            <AlertDialogCancel disabled={busy}>Keep record</AlertDialogCancel>
            <AlertDialogAction
              disabled={busy}
              onClick={(event) => {
                event.preventDefault();
                void remove();
              }}
            >
              {busy ? "Deleting…" : "Delete record"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
