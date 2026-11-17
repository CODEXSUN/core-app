import { useState } from "react";
import { RecordDetailV1 } from "@workspace/ui/blocks/record-detail-v1";
import { Button } from "@workspace/ui/components/button";
import { Badge } from "@workspace/ui/components/badge";
import { InformationPanel } from "@workspace/ui/blocks/information-panel";
import { ActivityFeed } from "@workspace/ui/blocks/activity-feed";

export function RecordDetailExample() {
  const [state, setState] = useState("ready");
  const [notice, setNotice] = useState("");
  return (
    <div className="space-y-5">
      <div className="flex flex-wrap gap-2">
        {["ready", "loading", "error", "empty"].map((mode) => (
          <Button
            key={mode}
            variant="outline"
            aria-pressed={state === mode}
            onClick={() => setState(mode)}
          >
            {mode}
          </Button>
        ))}
      </div>
      <RecordDetailV1
        title="Northwind Studio"
        description="Sample customer · C-0001"
        status={<Badge variant="outline">Active</Badge>}
        loading={state === "loading"}
        error={state === "error" ? "Sample record could not load." : undefined}
        empty={state === "empty"}
        onRetry={() => setState("ready")}
        actions={
          <Button
            variant="outline"
            onClick={() =>
              setNotice("Preview edit requested. No record was changed.")
            }
          >
            Edit sample
          </Button>
        }
        sections={[
          {
            id: "contact",
            title: "Contact details",
            fields: [
              { id: "name", label: "Customer", value: "Northwind Studio" },
              { id: "email", label: "Email", value: "preview@example.com" },
              { id: "phone", label: "Phone", value: null },
              { id: "open", label: "Open enquiries", value: 0 },
            ],
          },
          {
            id: "ownership",
            title: "Ownership",
            fields: [
              { id: "owner", label: "Assigned to", value: "Preview user" },
            ],
          },
        ]}
        activity={
          <ActivityFeed
            items={[
              {
                id: "created",
                kind: "Created",
                time: "Preview",
                message: "Sample record created.",
              },
            ]}
          />
        }
        aside={
          <InformationPanel title="Related records">
            Apps provide authorized related records and callbacks.
          </InformationPanel>
        }
      />
      <p role="status" className="min-h-5 text-sm text-muted-foreground">
        {notice || "Sample data only. No API is connected."}
      </p>
    </div>
  );
}
// Apps provide permitted data/formatting and real loading/error/retry state. No fetch or mutations in the block.
// Defaults: loading=false, empty=false; missing values show —, numeric zero remains visible.
// In an app shell, put Edit/Back actions in MainLayout headerActions and omit the inline actions prop.
// Keep list/form/detail routes and breadcrumbs app-owned. Do not duplicate AppHeader.
