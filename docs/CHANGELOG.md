# core-app Changelog

## Version State

Current version: 0.1.3

Release tag: v-0.1.3

Changelog label: v 0.1.3

Versions reflect independently tagged Core releases. The legacy contact port does not migrate Core's PostgreSQL database.

## v-0.1.3

### [v 0.1.3] 2026-11-18 - Preserve legacy contact compatibility

#### Database Changes

- Database update: No (manual).

#### App Codebase Changes

- Bumped @workspace/core-app version to 0.1.3.
- Preserve Home/custom phone types, root-only legacy phone/email records and normalized intake matching. Verified typecheck and 11 tests.

## v-0.1.2

### [v 0.1.2] 2026-11-18 - Core-owned legacy contact application port

#### Database Changes

- Database update: No (manual).

#### App Codebase Changes

- Bumped @workspace/core-app version to 0.1.2.
- Publish the Core-owned legacy contact host port and pure contact contracts for CRM Show/Create/Edit. Preserve source public/internal IDs and child ownership; validate fields, references, exact amounts, protected codes, duplicate identities and optimistic revisions. Core typecheck/build and eleven unit/tool tests passed; the CRM disposable legacy-schema suite verified persistence and rollback/access boundaries. No schema migration, seed or existing-record reset.

## v-0.1.1

### [v 0.1.1] 2026-11-18 - Audited application work and pinned container release contract

#### Database Changes

- Database update: No (manual).

#### App Codebase Changes

- Bumped @workspace/core-app version to 0.1.1.
- Include the current app-owned Platform authentication and business changes described in the work record. Add the common .container build/delegation contract and tagged image workflow, pinned to published UI 0.1.8, SDK 0.1.3 and governance source. Source typecheck/build and app/tool checks passed; CodeShip separately verifies image identity, database recovery and runtime admission. Existing data and public IDs are retained; no reset or seed is an update step.

## v-0.1.0

### [v 0.1.0] 2026-11-17 - Initialize core-app scaffold

#### Database Changes

- Database update: No (manual).
- No database or runtime data is created by this template.

#### App Codebase Changes

- Create the governed app structure, shared UI/framework references, environment examples, and work records.
- Include app-local GitHub review, version checks, patch bump/preview, and optional SSH-key tools.
- Dependencies, typecheck, frontend build and unit/tool checks verified before publication.
- Publish all 37 Core modules, public APIs and Billing client contracts; preserve standard local web/API port configuration.

- Adapted Company, Financial Year and Contact from CODEXSUN reference behavior, using explicit PostgreSQL modules and public APIs.
- Added shared List/Show/New/Edit screens, scoped permissions, local development sessions and read-only Billing client contracts.
- Verified migration/seed/rollback, cross-tenant access, current-year concurrency and exact date-only serialization with isolated PostgreSQL schemas.

- Completed all 37 Core module leaves, public references, default-company/organisation context, richer party records and exact-decimal product/tax data.
- Added tenant-scoped, repeatable seeders for 348 reference values; excluded the negative tax sentinel.
- All 37 browser lists, seven representative New/Cancel screens and mobile product create/edit/reload/history protection verified.
- Seven unit/tool tests and 45 PostgreSQL acceptance checks passed; build is warning-free.
