import {
  RecordDetailV1,
  type RecordDetailV1Props,
} from "@workspace/ui/blocks/record-detail-v1";

/** App supplies authorized record fields, status and API states, never implementation copies. */
export function RecordDetailPage(props: RecordDetailV1Props) {
  return <RecordDetailV1 {...props} />;
}
// Supply permitted Edit/Back buttons through MainLayout headerActions; leave actions unset here.
// Apps own record fetching, missing/denied states, formatting, activity and related-record callbacks.
