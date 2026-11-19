# Core App supervised audit — 2026-11-19

Latest follow-up: immutable0.1.6 at28bac4d4fac100d50592dbf9feb5b4cac34e4fe4 is published with successful workflow44441018652 and verified image/manifest. It includes0.1.5 bounded Billing catalogue/setup contracts plus the measured Core own-desk3MiB collection fix across all37 remote lists. See [Core list audit](supervisor-audit-20261119-core-lists.md) and [catalogue audit](supervisor-audit-20261119-catalog.md) for actual bytes, tests, dependencies, compatibility and ordered CodeShip deployment/live-audit status. Historical0.1.4 evidence below remains unchanged.

Status: release-ready; typecheck, production frontend build, all14 unit/tool tests and all46 disposable PostgreSQL checks passed. Immutable dependency pins are framework0.2.0 at51daaa2a7bee32d0a8eca806a2b0e8a765a3e1ac, UI0.1.12 ate88945f101313051ded3557e14b0363a0a6ca906, SDK0.1.5 at8bd3a9ed00b505a3ee0bf28ce9fc531d880b3e99. Tagged publication and image workflow succeeded; exact handoff below. No Docker deployment has been performed by this app owner.

## Findings and changes

- Billing's measured 1.4–1.7 second context path performs organisation then five Core HTTP reads. Added a purpose-built read-only Core aggregate so Billing can make one delegated read with one authenticated context. No cross-request authorization cache or new permission bypass.
- Core's home/detail shell imposed max-w-7xl. Removed the arbitrary dashboard width cap, retained min-w-0 and responsive padding. Forms keep their deliberate own reading widths. Mobile visual verification is pending.
- Adopted the public framework waitForReadiness helper around a finite PostgreSQL SELECT1 probe before listening. Only known temporary connection/recovery errors retry; invalid credentials, missing schema/database, permission and configuration errors do not. Existing schema readiness runs separately and never migrates/seeds. Failed startup closes its pool. Core already uses WorkspaceAccessGate; its shared retry implementation remains with the UI owner rather than copied here.
- Module-local migration files and discovery already provide unique sortable names; Kysely owns ordered history/locking, and explicit migration/seed commands remain separate from startup. This change adds no migration and rewrites no applied history. Existing upgrade/seeding/isolation checks are rerun on disposable schemas.

## Billing public contract

`GET /api/v1/billing-context?companyId=aaaaaaaa&financialYearId=bbbbbbbb`

Client: `core.getBillingContext({companyId?,financialYearId?})` from `@workspace/core-app/client`. Types are exported as `@workspace/core-app/contracts/billing-context`.

Returns `{organisation,company,financialYear,contacts,products,currencies}`. Organisation contains the current tenant defaults. Optional company/year selections are validated public IDs and resolve only through the authenticated tenant's module boundary. Missing defaults return404; invalid/extra query values400; missing constituent permissions403; unavailable/foreign/inactive selection409. Tenant B cannot borrow tenant A's default/selection. Required permissions: master/default-company:read, master/company:read, master/financial-year:read, master/contact:read, master/product:read, common/currency:read. Each owning module still enforces permissions and tenant scope. Billing must apply its own actor company/year policy before exposing the aggregate to its browser.

The endpoint remains read-only and uses existing scoped Core records. It does not guarantee a cross-query transaction snapshot or replace write-time reference validation. Gateway response/body limits remain in force; large reference catalogues still need a separately designed paginated lookup contract rather than unlimited aggregate growth.

## Release handoff

Published patch0.1.4 with successful tagged workflow/manifest; CodeShip deployment remains a separate stage. Native processes, database contents and unrelated Compose/work-record changes are preserved. No source change is being described as already live. SQL checks cover all37 modules, scoped read/write permission boundaries, foreign-tenant IDs, aggregate invalid/foreign selections, reference constraints, concurrent semantics, immutable upgrade preservation, repeatable seed identities and refused destructive rollback. The aggregate auth test rejects each missing constituent permission before database access; the client test proves one HTTP request and validates selection IDs.

Additional real startup test: a loopback transport to the existing isolated *_test PostgreSQL database starts100ms late. The finite connection probe retries ECONNREFUSED, succeeds after two attempts (323ms recorded), and cleans its pool/socket resources. No native/Docker service or database was restarted.

## Verified immutable release handoff

Status: release-ready for CodeShip; source and image publication complete, Docker rollout remains CodeShip-owned. Published v-0.1.4 at aa7ba24f38e86d0bdbababa2c452a7747e72600a. [Tagged workflow44432363908](https://github.com/CODEXSUN/core-app/actions/runs/44432363908) succeeded; [release](https://github.com/CODEXSUN/core-app/releases/tag/v-0.1.4) and release-manifest.json were retrieved and verified.

Image: ghcr.io/codexsun/core-app@sha256:e544e449e0ed4e8a27e283495c39ef594e6638e310d56ccfad65d746ecb54163. Manifest image ID: sha256:e544e449e0ed4e8a27e283495c39ef594e6638e310d56ccfad65d746ecb54163. Image archive SHA256: 9ef27d10c4237321db76db01e71693661c35fdb6f654abede6736280ce347891.

CodeShip must deploy Core before a Billing release consuming getBillingContext; verify origin14345:4345, readiness, retained data, grants and representative delegated aggregate reads. This is an image-only change with no new migrations; check actual installed history before deciding migration/backup stages. Mobile/full-width live app screenshots and measured Billing latency remain post-deployment supervisor checks; source tests are not that evidence. Existing old Docker baseline was Core0.1.1 on4454 at audit start. Native processes and unrelated historical work-record changes remain preserved.
