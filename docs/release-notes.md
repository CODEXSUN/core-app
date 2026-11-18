# core-app tagged release

This patch publishes the Core-owned, server-only legacy contact application port for CRM's authorized existing-record Show/Create/Edit work. Public contracts cover complete contact values; the owner implements transactional persistence, parent-owned child IDs, protected records, references, duplicate identities and optimistic revisions. No Core PostgreSQL schema, native credentials or installed service configuration changes.

Validation: typecheck, frontend build and eleven unit/tool tests passed; CRM's disposable MariaDB integration verified the host port against the existing schema shape. No real business data was inserted by these tests. See docs/legacy-contact-port.md.

The matching docs/CHANGELOG.md records product changes. Builds use published, immutable sibling pins; application secrets and runtime data are excluded. CodeShip owns installation, migration planning, checked recovery backups when migrations are pending, image replacement and verification. Product shell entries delegate to CodeShip.

An image release is not an installation certificate. Installation requires the reviewed core-app runtime/database adapter and Platform service/tenant registration; unsupported targets stop before changes. Never bypass authentication, reset data or reuse another app's database to make readiness pass.
