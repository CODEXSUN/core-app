# core-app Changelog

## Version State

Current version: 0.1.0

Release tag: v-0.1.0

Changelog label: v 0.1.0

Application version remains 0.1.0. The completed Core implementation is being published to CODEXSUN/core-app; no Core release tag/version bump was requested.

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
