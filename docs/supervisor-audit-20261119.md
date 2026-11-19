# Core App supervised audit — 2026-11-19

Status: source-verified; typecheck, production frontend build, all13 unit/tool tests and all45 disposable PostgreSQL checks passed. Pinned dependency release and tagged publication remain pending. No Docker deployment has been performed by this app owner.

## Findings and changes

- Billing's measured 1.4–1.7 second context path performs organisation then five Core HTTP reads. Added a purpose-built read-only Core aggregate so Billing can make one delegated read with one authenticated context. No cross-request authorization cache or new permission bypass.
- Core's home/detail shell imposed max-w-7xl. Removed the arbitrary dashboard width cap, retained min-w-0 and responsive padding. Forms keep their deliberate own reading widths. Mobile visual verification is pending.
- Startup depends on the generic framework and shared UI recovery work being published by their owners; Core already uses WorkspaceAccessGate and the framework server. Those implementations are not copied into Core.
- Module-local migration files and discovery already provide unique sortable names; Kysely owns ordered history/locking, and explicit migration/seed commands remain separate from startup. This change adds no migration and rewrites no applied history. Existing upgrade/seeding/isolation checks are rerun on disposable schemas.

## Billing public contract

`GET /api/v1/billing-context?companyId=aaaaaaaa&financialYearId=bbbbbbbb`

Client: `core.getBillingContext({companyId?,financialYearId?})` from `@workspace/core-app/client`. Types are exported as `@workspace/core-app/contracts/billing-context`.

Returns `{organisation,company,financialYear,contacts,products,currencies}`. Organisation contains the current tenant defaults. Optional company/year selections are validated public IDs and resolve only through the authenticated tenant's module boundary. Missing defaults return404; invalid/extra query values400; missing constituent permissions403; unavailable/foreign/inactive selection409. Tenant B cannot borrow tenant A's default/selection. Required permissions: master/default-company:read, master/company:read, master/financial-year:read, master/contact:read, master/product:read, common/currency:read. Each owning module still enforces permissions and tenant scope. Billing must apply its own actor company/year policy before exposing the aggregate to its browser.

The endpoint remains read-only and uses existing scoped Core records. It does not guarantee a cross-query transaction snapshot or replace write-time reference validation. Gateway response/body limits remain in force; large reference catalogues still need a separately designed paginated lookup contract rather than unlimited aggregate growth.

## Release handoff

Pending dependency owner SHAs, patch/tag, successful workflow/manifest, and CodeShip deployment. Native processes, database contents and unrelated Compose/work-record changes are preserved. No source change is being described as already live. SQL checks cover all37 modules, scoped read/write permission boundaries, foreign-tenant IDs, aggregate invalid/foreign selections, reference constraints, concurrent semantics, immutable upgrade preservation, repeatable seed identities and refused destructive rollback. The aggregate auth test rejects each missing constituent permission before database access; the client test proves one HTTP request and validates selection IDs.
