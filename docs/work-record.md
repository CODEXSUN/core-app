## 2026-11-18 — CRM contact compatibility v-0.1.3

Preserved source phone types and root-only phone/email values; normalized intake matching. Typecheck and 11 tests passed. No schema or existing-record changes.

# Work Record

## 2026-11-18 — CRM legacy contact application port

- User authorized complete CRM contact/enquiry/task Show/Create/Edit against existing Codexsun records and a tagged local deployment. Added the public Core-owned legacy-contact host port and pure validation/types contract so contact writes remain with Core. Existing PostgreSQL APIs/runtime/data are unchanged; no schema migration or seed runs.
- Full contact root fields, phone/email/address/bank/social values, exact decimal strings, reference hierarchy, protected records/codes, normalized identities, parent-owned child UUIDs and stale-write rejection are implemented. Host transactions and verified actor/tenant/operation callbacks are required. See legacy-contact-port.md.
- Core typecheck/build and eleven unit/tool tests passed; CRM's disposable legacy-schema integration exercised real persistence and rejection/rollback boundaries. No real source records were changed by verification. Release source excludes unrelated recovery documentation work preserved separately.

## Goal

Shared company, financial year and contact master data for business apps

## Completed

- Created the starting folders, governance instructions, shared package references, environment examples, and startup files.
- Generated-file audit recorded in `docs/creation.json`.

## Next

- [ ] Review and agree on the first business outcome.
- [ ] Install and build the shared framework and UI in their own repositories.
- [ ] Install this app's dependencies and build its frontend.
- [ ] Run preflight and verify the health endpoint, page, and theme selector.
- [ ] Define the first module's public contract and implement only that authorized step.

## Decisions and open questions

- Uses the shared default design system and shared server framework.
- Module routing must follow the central Routes and navigation guide: internal `/api/v1` calls, clean browser paths, `/api/docs`, and URL/history state restoration. These are instructions until implemented and verified.
- Database, authentication, deployment, and business features are not configured.
- Generated files are not proof that installation or runtime checks passed.

## Daily work

| Date | Request or goal | Completed | Next or blocked | Verification |
| --- | --- | --- | --- | --- |

Add a short entry after each completed work session. Keep credentials and sensitive data out of this record. Mark completion only after checking it.


## 2026-11-17 Core first delivery

Goal: create apps/core-app from the CODEXSUN reference, beginning with Company, Financial Year and Contact and public interfaces for Billing.

- Cloned CODEXSUN/core-app on main. Preserved its license, README/history and ignore rules. Replaced unavailable Assist instruction links with the workspace central governance link; original files are backed up under the workspace IDE folder.
- Generated the standard app (template 22) at port 4406, then implemented domain-specific contracts, services, repositories and coded PostgreSQL migrations. No runtime metadata CRUD factory is used.
- Company and Contact are tenant-owned party masters with unique uppercase codes, legal/tax identity, bounded email/phone/address values and active state. Contact role replaces an unimplemented Contact Type dependency. Financial Year is a tenant-owned calendar period; concurrent current-year changes serialize and enforce one active current year.
- Supported operation matrix: List GET collection (:read); Show GET public ID (:read); New POST (:write, 201, then Show); Edit PATCH complete editable values (:write, then Show). New Cancel goes to List; Edit Cancel goes to Show through the shared unsaved-change guard. Deletion/restoration deliberately unsupported.
- Shared Master List, Record Detail, Upsert Form, controls, shell and theme remain public UI imports. Navigation supports direct links and dirty-input handling, including a browser-history adapter; list control/query persistence remains a documented future extension.
- Configured dedicated local core_app/core_app_test databases and a restricted non-superuser role. Credentials remain only in ignored private configuration. Applied the three initial migrations explicitly. Seeds insert nothing. Startup does not migrate.
- Added server-bound service credentials with exact permissions and tenant scope; default unauthenticated access is denied. Browser sessions use HttpOnly/SameSite cookies and same-origin writes. Explicit loopback-only local access is enabled privately for development, with fixed local developer identity. Production Platform authentication and tenant membership integration are pending.
- Added read-only Billing client/type exports and a private client provisioning command. No Billing credential was issued and no Billing code changed.
- Verification: typecheck, warning-free browser build, seven auth/client/tool tests, three isolated PostgreSQL module suites and version consistency passed. Database suites cover fresh/repeated migrations, no-data seeds, rollback, tenant isolation, denial, protected fields, collision retries, uniqueness, concurrent current-year selection and exact calendar dates.
- Browser: local connection, Company list/new/validation/save/show/edit, Cancel/Stay protection, Financial Year save and persistence after server restart with exact dates, Contact primary email save/show/reload passed. Full mobile, browser-history transition and network-failure coverage remain unverified.
- Removed only the three exact browser-created verification records after checks. No source customer data was imported. Core remains running locally at 127.0.0.1:4406.
- Version remains 0.1.0. No commit, tag, push or deployment performed in this build task.

## 2026-11-17 Full Core scope authorized

Implement all 37 reference leaves in dependency order with module-owned fields, validation, PostgreSQL migrations and seeds, public APIs and shared List/Show/New/Edit screens. Preserve the three existing migrations and data. Company/contact enrichment is additive; no fake reference relationships or runtime CRUD registry. Get read interfaces ready for Billing; keep Billing unchanged. Verification remains pending until recorded.

## 2026-11-17 Full Core implementation verified

- All 37 reference leaves implemented with explicit owner contracts, queries, validation, migrations, seed policy, APIs and shared List/Show/New/Edit screens. No runtime CRUD registry was introduced.
- Applied 37 new/additive migrations after the three original migrations; baseline upgrade tests preserve prior IDs, fields and actor history. Destructive additive downgrade is refused.
- Installed 348 reference records for local-development. Seed reruns preserve IDs, inactive records and user edits; source negative tax sentinel excluded. No source customer/company data imported.
- Added all-module read client and tenant-bound organisation context for Billing. Nested party references, address hierarchy, composite tenant foreign keys, protected hyphen unit and default-company/year deactivation guards verified.
- Seven unit/auth/client/tool tests plus 45 PostgreSQL checks passed. Typecheck, warning-free build and version consistency passed. Browser loaded all 37 lists with New; seven New/Cancel screens passed. Product create via Unit lookup, mobile edit/save/reload and dirty Browser Back/Stay passed at 390x844; viewport restored.
- Removed only exact verification product nus3aj4r created by this browser check; unrelated data and scoped reference rows preserved.
- Documentation: completion.md, core-module-inventory.md, billing-api.md and reference-seed-inventory.json. Billing unchanged. Production identity/deployment and file-owning upload integration remain separate boundaries, not completed production work. Local app remains on port 4406.
- No commit, tag, push or release version change performed.


### 2026-11-17 — Authorised persistent Core/Billing test setup

Created Test Company - Billing QA, active/current Test FY 2026-27 (2026-04-01 to 2027-03-31), Test Billing default (landing Billing), test customer/supplier/product via Core public APIs. Billing Core connection now reports ready. Retained clearly labelled test quotation, converted confirmed sale, two posted receipts, confirmed supplier purchase and posted payment. Sale INR 2,360 settled; receipt advance INR 140; purchase/payment INR 590 settled. All 21 live API assertions passed, plus browser readback of defaults, conversion, balances and vouchers. See [Billing live test report](../../billing/docs/live-test-20261117.md) for links and individual checks. No real money moved; no source/release/commit/push changed.

## 2026-11-17 — Dedicated local port pair

- Set web 4340 and API 4345; updated environment defaults, development commands, strict Vite binding/API forwarding and applicable local navigation links. Existing unrelated work preserved.
- Typecheck and resolved Vite listener/proxy audit passed. No database migration/reset or production deployment. UIUX restart and web/API forwarding were verified live; other apps require their own terminal restart to adopt new settings. See central local-ports guide.


### 2026-11-17 — Authorised Core publication

Prepared the completed 37-module Core application, public APIs/client contracts, migrations, seeders, tests and current port-standard wiring for CODEXSUN/core-app. Retain application version 0.1.0; only Billing was requested as release v-1.0.3. Review private files and run checks before commit/push; verify publication against the remote. Local PostgreSQL data and credentials remain outside Git.

Release validation passed: typecheck, frontend build, 7 unit/tool checks, 45 PostgreSQL checks, version consistency and private-file scan. Remote main was synchronized before publication.

## 2026-11-17 — Consistent list header construction

- Shared AppHeader now keeps actions at 32px inside a 40px rail, uses the Tasks hover/focus lift with reduced-motion support, and makes the current breadcrumb semibold. MainLayout defaults to workspace action alignment; gallery import actions explicitly retain edge alignment. Shared workspace-list-content aligns list/table right edges with the header.
- Existing list shells and duplicate list headings were audited and adapted, including Billing financial lists, Codeship operations lists and Codeitz Todo Categories. UIUX live preview and typed usage use the shared content class. Governance and new-app template capture the construction rule. No Project Manager changes/builds.
- Shared UI build, nine app typechecks/builds, 13 governance tests and two Master List tests passed. UIUX browser measured header 40px and New 32px with table outer-edge alignment. UIUX suite has 15 passes and one unrelated Login example parity failure from ongoing auth-template work; those auth files were preserved.

- 2026-11-18: Opted this app into the shared one-time Silver rollout in provider and first-paint initialization; white/grey HTML fallback. Preserves mode, component defaults and subsequent Appearance choices. Shared UI source colour audit and representative UIUX screenshots verified; app typecheck and final production build passed. Project Manager excluded.

## 2026-11-18 — Coordinated tagged deployment contract

- Added the common .container build/Compose/delegation contract and pinned tagged release workflow. Shared SDK 0.1.2 is pinned to published commit 5f9f7b73ec8c01df698f2914676e83e9b1668d91; governance is available in the isolated CI source for setup audits. No local environment, database or credentials enter the build context.
- Source verification and runtime/database adapter audit are recorded separately by CodeShip. Contract generation alone does not install, migrate or certify a deployment.

## 2026-11-18 — Suite Platform authentication gate

- Connected/reviewed core-app through the shared Platform browser/session and one-use service-grant pattern. Preserved business records, existing module work and concurrent release/UI changes. See Platform's auth-gate-rollout.md and this app's platform-auth.md for the exact data scope and limits.
- Owning typecheck/build/tests/version checks passed. Native default-account login, tenant session, required password enforcement and logout were verified for newly connected apps; Texlinks' existing real verification was retained and its disposable two-tenant suite rerun. No real password change or database reset.
- Core/Billing/Ecommerce/Automation preserve explicit Codexsun database bindings; Zetro uses its dedicated PostgreSQL/RLS boundary; CRM/HRMS/Texlinks do not claim implemented business data. Local app settings stay ignored. Production/deployment and fuller account lifecycle remain separate work.

- Core public client now accepts an explicit delegated fetch transport without any fabricated static credential; its original token transport remains compatible. Focused transport tests and Core/Billing typechecks/tests passed.

## 2026-11-18 — Audited source release handoff

- Source typecheck/build and app/tool checks passed for the coordinated release, with restricted Docker database targets tested where needed. Dependency commits are published immutable versions. The user authorized including current app changes after audit.
- Tagged workflow success, database copy/migration planning, runtime checks and Platform admission remain separate CodeShip stages; source publication alone does not certify deployment.


## 2026-11-19 — Supervised startup and Billing-context capacity audit

Added a tenant-scoped read-only Billing aggregate using existing public module boundaries and all six constituent permissions; validated selected company/year IDs. Billing retains its own actor policy and write-time reference validation. One delegated Core HTTP request replaces the six-read integration path. Removed Core dashboard max-width cap with responsive minimum-width-zero padding. Adopted public framework bounded startup waiting for only temporary PostgreSQL recovery/transport errors, separate fatal schema checks and pool cleanup. No schema migration, seed/reset, native restart or live business write. Typecheck/build, 14 unit/tool tests and 45 existing PostgreSQL checks passed; an additional real temporary PostgreSQL transport startup-recovery test passed. Release pins/shared UI, tagged CI and CodeShip rollout are separate handoff stages. See supervisor-audit-20261119.md.

Final verification: all46 PostgreSQL checks including the real startup transport recovery passed. Release0.1.4 pins published framework0.2.0, UI0.1.12 and SDK0.1.5; no schema migration.

Verified release: v-0.1.4 at aa7ba24f38e86d0bdbababa2c452a7747e72600a; workflow44432363908 succeeded and immutable image/manifest were verified. CodeShip handoff is recorded in supervisor-audit-20261119.md; Core must deploy before consuming Billing. Live speedup and visual checks are not claimed before rollout.


## 2026-11-19 — Bounded Billing catalogue and setup contracts

Measured valid long5000-contact/5000-product fixture: previous Billing projection1,340,337 bytes exceeds Platform1MiB and returned502 through its actual gateway reader. Added lean bootstrap715 bytes, explicit caller-selected currencies(max10), SQL-paginated active contact/product options(max100), selected-ID resolution and exact totals with stableordering. Existing bulk contracts remain unchanged, no silent truncation. Added bounded setup status via scoped active-existence queries with original conditional permissions. Billing actor/company/year and write-time validation remain Billing-owned. Typecheck/build,16unit/tool and47PostgreSQL checks passed, including120parallel scopedSQLlookups and foreign/inactive/role/query/currency denials. TaggedCI now runs the complete disposable Core PostgreSQL suite. No migration, reset/seed, live data write, process restart or deployment. Full measurement/contract/handoff: supervisor-audit-20261119-catalog.md.


## 2026-11-19 — All37 Core lists use bounded server pages

Measured own Contact/Product ordinary collections3,058,894/3,095,001 bytes and confirmed502 through the actual Platform reader on a real5000-row disposable fixture. All37 owner modules now expose additive permission/tenant-scoped SQL page endpoints with displayed-column projections, bounded search/sort/filters, exact totals and stable ordering. All37frontend lists use the public remote mode with debounce, cancellation, stale-response guards and honest totals. Show/new/edit and legacy bulk/read contracts remain compatible. New100-row desk payloads20,439/21,247 bytes return200 through the actual gateway; byte-budget overflow fails413 with a smaller-page instruction instead of truncation. Typecheck/build,24unit/tool and47Postgres checks pass; no schema migration or live data/process changes. Pins UI0.1.13/SDK0.1.6; migration histories unchanged. Remote CSV export is explicitly unavailable pending a bounded implementation. See supervisor-audit-20261119-core-lists.md for release/live-audit boundaries.

Verified0.1.6 publication: tagv-0.1.6 commit28bac4d4fac100d50592dbf9feb5b4cac34e4fe4, workflow44441018652 success including24unit/tool and47PostgreSQL checks. Release/image manifest verified; exact immutable image/archive and consuming CodeShip handoff in supervisor-audit-20261119-core-lists.md. No live deployment claimed by source owner.

## 2026-11-19 — Bounded relationship forms and exact address cascades (0.1.7)

Replaced eager full foreign catalogue reads across ordinary relationship forms with on-demand remote pickers, selected-record GETs, inactive historical labels and abort/generation guards. Added narrow exact parent public-ID page constraints before count/paging with existing scoped parent resolver/read permissions. Legacy bulk APIs and fresh save validation remain unchanged. No migration/reset/seed. Measured old Product references 10,387,901 bytes; frozen UI 0.1.13 browser actual forms make zero eager reads, pages <=2,146 bytes and pass 360/768/1440 layouts, failures/recovery and cascade cancellation. 32 unit/tool and 49 PostgreSQL checks passed; isolated release verification/publication/deployment still pending. See supervisor-audit-20261119-reference-pickers.md. Concurrent unrelated Zetro home-page work is preserved outside this release.

0.1.7 final publication/deployment: helper tag v-0.1.7 at a4b429fd2f15770c8074f4669363318e3b93e198, successful workflow44446782301, immutable image fab45e03bed878f5b785d75ecc3d75e4920fd19a5c7a398148ff846d5b132782. Selected CodeShip update and independent verify passed at14345:4345;39tables/395rows,40migrationnames, grant fingerprints and16existing sibling identities unchanged. All3saved-role logins, workspace/bootstrap/lookups/exact cascades200; forged/context/origin/write denials and logout revocation passed. No reset/seed/schema/native change. Details: deployments/local-core-0.1.7-20261119.md. Platform owns separately confirmed cross-app encoded-query rejection; no Core grant workaround. Fixture/live timing is not a production100-user certification.

## 2026-11-20 — App launcher and tab sessions

Prepared v-0.1.8 from the published v-0.1.7 baseline. The workspace launcher reads the authenticated Platform catalogue; UI 0.1.19 and SDK 0.1.11 are pinned for launcher and tab-session behavior. No database migration or access grant is included. With the exact pinned sibling sources, typecheck, production build, 32 unit/tool tests, and version checks passed. Local Docker update and cross-app live verification remain pending.

## 2026-11-20 — Authenticated launcher catalogue

Prepared v-0.1.9 using SDK 0.1.12 and UI 0.1.19. The launcher uses the authenticated Platform catalogue and preserves existing app permissions. The exact-pinned typecheck, production build, unit/tool tests and version checks passed. No database migration or access grant is included. Local Docker and cross-app live verification remain pending.


## 2026-11-20 — Complete native backend CRUD/delete audit and Billing integration (unreleased)

Added scoped, module-specific delete permissions/services/routes/OpenAPI for all 37 Core modules. Soft deletion retains public IDs and actor/time audit, hides ordinary list/page/single reads and cannot be undone through update. Live inbound SQL foreign keys and company/contact JSON address/bank references block deletion. Deletion locks the master against reference creation; all same-database reference resolvers retain their shared locks. Current financial-year deletion clears is_current atomically, fixing the existing active/current constraint interaction; default selections continue to prevent deletion while referenced. No Core migration was required and no real permission grants changed.

Added all-module editable-field create/update/read persistence checks against actual SQL columns, a captured read-only Codexsun Core field fixture, and a full inventory/comparison of 37 native modules and 521 columns. Explicit legacy-to-native differences (IDs/audit/status, child IDs/labels/order, logo paths, industry relationship, ancestry/default derived fields and company/year-scoped Billing openings) are listed in backend-verification.md and backend-field-inventory.md. Strict native APIs do not silently accept missing legacy fields; no old client data import was performed.

Final verification: typecheck passes; all 45 unit/tool tests pass; all 91 PostgreSQL checks pass, zero failures/skips. Covers 37-module CRUD and references, hidden/retained deleted records, JSON master protection, current-year deletion, delete-versus-dependent-create race, permission/tenant failures, seeds, upgrade recovery and bounded catalogue regressions. Billing separately passes 40 PostgreSQL checks against the actual Core API/public client plus six-module canonical lifecycle/settlement/conversion tests, including preserving historical master snapshots after rename/deletion. All database work used disposable _test schemas; no Docker/client fixture writes.

Source-only candidate; version remains 0.1.7, no commit/push/tag/deployment/grant/live migration. Local Docker hold remains active, Ubuntu remains stopped. Existing unrelated home sidecar/Ubuntu adapters/tests/docs are preserved. Billing verification overlays this unpublished backend source; future release must publish and pin the matching Core commit before clean-source release certification.


## 2026-11-20 — Core list/form/delete connections (unreleased)

Connected the 37 existing Core detail screens to a Core-owned delete confirmation using public shared UI controls and the existing Platform browser transport. The header receives the module-specific delete grant independently from write access; no runtime grants were added. Failed dependency checks stay in the dialog with the owner's message, and successful deletion returns to the module list. Existing list, form, save, reference and unsaved-change behavior is retained. Preserved the unrelated Zetro home composition while adding only the permission prop at its module boundary.

Both owner typecheck and production build pass; 45 unit/tool checks pass. Production-bundle acceptance through the actual Core API and disposable database passes all 37 list/edit/save flows plus visible referenced-master denial and successful unreferenced deletion (38 test results). The test-only browser supplies the Web Locks behavior required by the current workspace SDK; no production tab-isolation/security behavior changed.

The fixture audit exposed Kysely migration-table discovery seeing tables in a sibling test schema. Core now resolves current_schema and supplies migrationTableSchema explicitly, matching the existing Billing approach; callers await the migrator consistently. No runtime migrations were executed, no historical migration files changed, and no schema/permission/deployment changes were applied to local Docker. Final full database regression is recorded separately after completion. Source remains version 0.1.7 and unpublished; unrelated Ubuntu/sidecar work remains intact.


Final database regression after schema-specific migration bookkeeping passes all 91 tests, zero failures/skips. Frontend owner results: typecheck/build pass, 45 unit/tool and 38 actual production-bundle/Core-API UI checks pass. See frontend-wiring-review.md. All testing used disposable schemas; no live changes or release actions.


## 2026-11-20 — Prepare Core App 0.1.10 for direct local Docker update

The user explicitly authorized version/log updates, commit/push and direct deployment of Platform, Core App and Billing. Built this isolated source on the newest published owner release, preserving its current authentication/launcher pins and unrelated primary work. Complete 37-module CRUD, guarded soft deletion, JSON master-reference protection and the current-year deletion constraint. Wire all native list/detail/edit/delete screens while preserving shared ownership and public IDs. No Core schema changes or user grant changes.

The earlier Docker hold is superseded only for this selected local rollout. Wait for the active other deployment owner to finish; do not message or hand off execution. Ubuntu/VPS stay stopped. Release checks and actual deployment evidence follow below.


Release candidate 0.1.10 verified against the published Framework/UI/SDK pins inherited from 0.1.9: clean install, typecheck and production build pass; 32 owner unit/tool tests, all 91 PostgreSQL checks and 38 production-bundle UI/API checks pass. Ubuntu-only tests/adapters remain excluded from this local app release. Existing migration names/contents are unchanged. Source reviewed for private environment/runtime files; only the authorized backend/frontend/docs work is selected. Immutable publication precedes any local update.

## 2026-11-23 — Canonical main consolidation and shared loader cleanup

Merged published 0.1.8–0.1.10 history into canonical main without rewriting it. Docs-only conflict resolution retained both deployment records. Native tracked/untracked edits were checkpointed as stash d08bd2313354c6909be05df9936454d4ea9b3269 before merging; older checkpoints remain. Reapplied only completed app-owned loader/provider/bootstrap/reference-picker and public Zetro sidecar hunks, preserving newer auth and menus. Restored earlier source-only Ubuntu helpers/tests under their original explicit 0.1.7 contract; 13 mocked tests pass, zero skipped, and no host hooks were invoked. Business API/migrations/grants remain unchanged. No new worktrees or source clones were created; exact-source validation uses ordinary ignored local snapshots. Shared dependency verification and publication outcomes follow. No deployment authorized.

Final 23 November checks: exact published UI0.1.26(62fa0936b1bcbbd8ca30eda2934424ae2e09163d), existing SDK0.1.12(ccff028cc970174ed9283beca07834e5290b2bfd) and Framework51daaa2a7bee32d0a8eca806a2b0e8a765a3e1ac. Clean app installs completed; frozen-source typecheck/build and 45 app/tool checks pass with zero failures/skips. UI26 compiled output and verified unchanged UI25 dependency graph reused read-only; native shared dependency installs were not treated as release proof. Read-only built-asset browser fixtures showed exactly one pending loader (bootstrap0/React1/visible text empty), settled sign-in with no loader, and a missing-script startup error with Reload in both apps. Previews stopped; no live user/account/financial writes. SDK12 and UI25/26 explicit-login selected-session revocation policy is preserved by supervisor policy decision; this does not certify broader shared-tab or15-minute login continuity. No Platform action or deployment. Billing retains the existing chart/report chunk-size advisory. Histories/checkpoints and public source references are retained for recovery; safe branch retirement follows pushed-main inclusion checks.

## 2026-11-23 — Disposable artifact closure

The joint Billing/Core owned validation area .local/billing-core-cleanup-20261123 was inventoried without following its 251 junctions. No owned process or CodeShip operation consumed it. Removed seven reproducible source archives (18,531,731 bytes) and four physical temporary app dist directories (6,584,392 bytes), totaling 25,116,123 bytes freed across both apps; this is one joint total, not per app. The deleted build folders were apps/core-app/dist, apps/billing/dist, ui26-validation/apps/core-app/dist and ui26-validation/apps/billing/dist under that validation area only. Published source histories, final check logs/receipts, recovery stashes, private configuration, certified UI25/26 and shared Framework/SDK dependency targets were retained. Automatic approval rejected collection removal of the inactive dependency links with 'blocked by policy'; the linked installs/source snapshots remain preserved rather than bypassing that rejection. No unsupported working-tree hunk required rollback; accepted published source and documented deferred features remain unchanged. Documentation-only closure, version unchanged, no new tests/features/worktrees, Docker pruning, service changes or deployment.
