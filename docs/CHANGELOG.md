# core-app Changelog

## Version State

Current version: 0.1.9

Release tag: v-0.1.9

Changelog label: v 0.1.9

Versions reflect independently tagged Core releases. The legacy contact port does not migrate Core's PostgreSQL database.

## v-0.1.9

### [v 0.1.9] 2026-11-20 - Allow the launcher catalogue through the app bridge

#### Database Changes

- Database update: No (manual).

#### App Codebase Changes

- Bumped @workspace/core-app version to 0.1.9.
- Pin SDK 0.1.12 so the authenticated launcher catalogue is available through the app bridge.

## v-0.1.8

### [v 0.1.8] 2026-11-20 - Add tab-isolated app launcher

#### Database Changes

- Database update: No (manual).

#### App Codebase Changes

- Bumped @workspace/core-app version to 0.1.8.
- Connect the shared app launcher to the authenticated Platform catalogue and pin the tab-session SDK and launcher UI releases.

## v-0.1.7

### [v 0.1.7] 2026-11-19 - Bound form reference choices and preserve exact address cascades

#### Database Changes

- Database update: No (manual).

#### App Codebase Changes

- Bumped @workspace/core-app version to 0.1.7.
- Replace eager relationship catalogue reads with bounded on-demand pickers; preserve inactive selected labels, permissions and write validation.
- Add exact owner-scoped parent-ID constraints before address page totals; cancel stale requests on parent changes.
- Verify 32 unit/tool tests, 49 PostgreSQL checks and frozen-package browser forms at 360/768/1440; no migration.

## v-0.1.6

### [v 0.1.6] 2026-11-19 - Bound all Core master lists with controlled server pages

#### Database Changes

- Database update: No (manual).

#### App Codebase Changes

- Bumped @workspace/core-app version to 0.1.6.
- Move all37 Core master-list screens to controlled remote pages; add per-owner bounded scoped page reads with allowlisted search/sort/column/status filters and exact totals. Preserve old bulk and full-record contracts.
- SQL-select displayed scalar fields before paging response; measured contact/product100-row pages20,439/21,247 bytes pass the actual gateway where old3MiB collections fail. Explicit byte-budget errors request a smaller page without truncation.
- Preserve show/new/edit flows; debounce/cancel stale list requests, validate metadata and hide unimplemented whole-dataset export instead of mislabeling a page.
- Pin public UI0.1.13 and SDK0.1.6; typecheck/build,24 unit/tool checks and47 PostgreSQL checks pass. No schema migration, native restart, live data write or deployment.

## v-0.1.5

### [v 0.1.5] 2026-11-19 - Bound Billing catalogue lookups and setup checks

#### Database Changes

- Database update: No (manual).

#### App Codebase Changes

- Bumped @workspace/core-app version to 0.1.5.
- Add lean Billing bootstrap, explicit bounded currency selection, SQL-paginated active contact/product lookups and selected-ID reads with trusted tenant/permission checks. Keep existing bulk/read contracts unchanged; do not truncate catalogues.
- Replace four setup reads with one bounded status contract preserving original constituent permissions and missing-default behavior.
- Verified 5000 contacts plus 5000 products: former Billing projection1,340,337 bytes fails the actual gateway reader; bootstrap715 bytes and 100-row pages14,347/15,347 bytes pass.120 concurrent fixture SQL lookup requests preserve scope and response bounds.
- Typecheck/build,16 unit/tool tests and47 PostgreSQL checks pass. Release CI now runs the full disposable Core database suite. No schema migration, live data changes or deployment.

## v-0.1.4

### [v 0.1.4] 2026-11-19 - Bound Core startup and aggregate scoped Billing context

#### Database Changes

- Database update: No (manual).

#### App Codebase Changes

- Bumped @workspace/core-app version to 0.1.4.
- Aggregate Billing context into one tenant-scoped authenticated read while retaining all six constituent module permissions; validate company/year selections and retain Billing-owned actor policy checks.
- Remove the dashboard width cap and retain responsive minimum-width-zero content padding.
- Wait on known temporary PostgreSQL connection/recovery failures through the public framework helper before listening; fail authentication/schema/configuration errors without retrying migrations. Close pools on startup failure.
- Typecheck/build, 14 unit/tool tests and 46 disposable PostgreSQL checks passed; live deployment and browser width measurements remain separately verified stages.

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
