# v-0.1.10

Complete 37-module CRUD, guarded soft deletion, JSON master-reference protection and the current-year deletion constraint. Wire all native list/detail/edit/delete screens while preserving shared ownership and public IDs. No Core schema changes or user grant changes.

Preserves the latest published login/launcher behavior. Release source is isolated from unrelated primary edits. Local Docker update is explicitly authorized; only selected Platform/Core App/Billing operations will run after the other active owner completes. Existing data, credentials, grants and sibling containers must be preserved.

See backend-verification.md, frontend-wiring-review.md and work-record.md for verified test cases and remaining source/visual/import limitations. No Ubuntu or VPS rollout is authorized.
