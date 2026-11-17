import { useState } from "react";
import { useUnsavedChangesGuard } from "@workspace/ui/blocks/unsaved-changes-guard";
import { Input } from "@workspace/ui/components/input";
import { Button } from "@workspace/ui/components/button";

export function UnsavedChangesExample() {
  const [value, setValue] = useState("Sample record");
  const [saved, setSaved] = useState("Sample record");
  const [notice, setNotice] = useState("Edit the name, then try leaving.");
  const [busy, setBusy] = useState(false);
  const dirty = value !== saved;
  const guard = useUnsavedChangesGuard({ dirty, busy });
  function leave() {
    setValue(saved);
    setNotice("Preview navigation completed. No browser route changed.");
  }
  return (
    <div className="max-w-xl space-y-4">
      <label className="grid gap-2 text-sm">
        Record name
        <Input
          value={value}
          onChange={(event) => setValue(event.target.value)}
        />
      </label>
      <p className="text-sm text-muted-foreground">
        {dirty ? "Unsaved changes" : "All changes saved"}
      </p>
      <div className="flex flex-wrap gap-2">
        <Button
          disabled={!dirty || busy}
          onClick={() => {
            setSaved(value);
            setNotice("Saved in this preview only.");
          }}
        >
          Save sample
        </Button>
        <Button
          variant="outline"
          disabled={busy}
          onClick={() => guard.requestNavigation(leave)}
        >
          Leave preview
        </Button>
        <Button
          variant="ghost"
          aria-pressed={busy}
          onClick={() => setBusy((current) => !current)}
        >
          Toggle saving preview
        </Button>
      </div>
      <p role="status" className="text-sm">
        {notice}
      </p>
      {guard.dialog}
    </div>
  );
}
// Render guard.dialog once. Call requestNavigation(() => navigate(destination)) for every app-owned leave action.
// Returns true if executed, false if prompted or blocked by busy. busy=false by default; never leave while saving.
// Only mark dirty=false after a successful real save. Stay preserves data; discard executes the pending callback once.
// Reload/tab close gets a native browser warning while dirty, subject to browser interaction/platform limits.
// Router Back/Forward/popstate and arbitrary links are NOT intercepted automatically: integrate your router's blocker.
// Browser warning text is controlled by the browser. This hook does not save or persist anything.
