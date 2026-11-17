import type { ReactNode } from "react";
import { useClipboard, Button } from "@workspace/ui";
import {
  SettingsNav,
  type SettingsNavItem,
} from "@workspace/ui/blocks/settings-nav";
import {
  StageProgress,
  ProgressMeter,
} from "@workspace/ui/blocks/work-progress";
import {
  ActivityFeed,
  type ActivityFeedItem,
} from "@workspace/ui/blocks/activity-feed";
import {
  CheckResults,
  type CheckResultItem,
} from "@workspace/ui/blocks/check-results";
import {
  RecordList,
  type RecordListItem,
} from "@workspace/ui/blocks/record-list";
import { InformationPanel } from "@workspace/ui/blocks/information-panel";
import { ImportPathAction } from "@workspace/ui/blocks/import-path-action";
import { PreviewFrame, UsageCode } from "@workspace/ui/blocks/preview-frame";

type Props = {
  sections: readonly SettingsNavItem[];
  section: string;
  onSectionChange: (id: string) => void;
  stages: readonly string[];
  completed: number;
  activeIndex?: number;
  running?: boolean;
  events: readonly ActivityFeedItem[];
  checks: readonly CheckResultItem[];
  records: readonly RecordListItem[];
  selected?: string;
  onSelectRecord: (id: string) => void;
  relatedContent: ReactNode;
};

// App-owned data adapters format time and derive statuses; no API calls in blocks.
export function SharedPatternsExample(props: Props) {
  return (
    <div className="space-y-5">
      <SettingsNav
        items={props.sections}
        value={props.section}
        onValueChange={props.onSectionChange}
      />
      <StageProgress
        stages={props.stages}
        completed={props.completed}
        activeIndex={props.activeIndex}
        running={props.running}
        label="Completed stages"
      />
      <ProgressMeter
        label="Completed checks"
        value={props.checks.filter((check) => check.passed).length}
        max={props.checks.length}
      />
      <ActivityFeed
        label="Activity"
        items={props.events}
        autoScroll={true}
        emptyMessage="No activity yet."
      />
      <CheckResults items={props.checks} emptyMessage="Checks have not run." />
      <RecordList
        items={props.records}
        selected={props.selected}
        onSelect={props.onSelectRecord}
        emptyMessage="No records in this view."
      />
      <InformationPanel title="Related information">
        {props.relatedContent}
      </InformationPanel>
    </div>
  );
}

// Developer preview/documentation only; do not add gallery chrome to business pages.
export function SharedDocumentationExample({
  source,
  preview,
}: {
  source: string;
  preview: ReactNode;
}) {
  const { copied, error, copyText } = useClipboard();
  return (
    <div className="space-y-5">
      <ImportPathAction path="@workspace/ui/blocks/record-list" />
      <PreviewFrame name="Example">{preview}</PreviewFrame>
      <UsageCode code={source} />
      <Button type="button" onClick={() => void copyText(source)}>
        {copied ? "Copied" : "Copy text"}
      </Button>
      <span role="status">{error}</span>
    </div>
  );
}

// SettingsNav: value/items/onValueChange required; label="Settings sections".
// StageProgress: completed/stages required; running=false. Actual counts, not estimates.
// ProgressMeter: label/value/max required; maximum is clamped to at least 1.
// ActivityFeed: items required; autoScroll=true, label="Activity". IDs: string|number.
// CheckResults: items={name,passed,output}[]; output is rendered as plain text.
// RecordList: items={id,title,eyebrow?,status?,time?}[]; selected/onSelect are app-owned.
// RecordList is a master/detail selector. Use MasterListV1 for tabular data.
// InformationPanel: title and children required.
// ImportPathAction: path required. UsageCode: code required, title="Usage code".
// useClipboard handles failure and clears copied feedback after two seconds.
