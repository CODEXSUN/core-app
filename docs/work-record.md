# Work Record

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
