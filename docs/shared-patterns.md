# Shared app patterns

Use `src/web/modules/shared/patterns.example.tsx` as a typed integration reference. The same source is shown in UIUX → Blocks → Shared Patterns. Settings already imports shared SettingsNav.

Import reusable UI from its public path:

- SettingsNav: `@workspace/ui/blocks/settings-nav`
- StageProgress and ProgressMeter: `@workspace/ui/blocks/work-progress`
- ActivityFeed: `@workspace/ui/blocks/activity-feed`
- CheckResults: `@workspace/ui/blocks/check-results`
- RecordList: `@workspace/ui/blocks/record-list`
- InformationPanel: `@workspace/ui/blocks/information-panel`
- ImportPathAction: `@workspace/ui/blocks/import-path-action`
- PreviewFrame and UsageCode: `@workspace/ui/blocks/preview-frame`
- useClipboard: `@workspace/ui`

Apps provide records, statuses, formatted times, permissions, route handlers and API callbacks. Do not copy the shared rendering, clipboard mechanism, styling or control state. RecordList is for master/detail selection; MasterListV1 remains the table default. Preview/copy-source controls belong in developer/documentation screens, not ordinary business flows.

The example module does not create routes or connect to real services. Integrate only relevant patterns, following the central Shared app patterns and Shared frontend guides. Add missing reusable behavior in packages/ui and demonstrate it in UIUX before app consumption.
