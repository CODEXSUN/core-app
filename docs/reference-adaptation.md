# CODEXSUN Core adaptation

The completed scope now includes all 37 reference leaves. See [completion](completion.md) and the [module inventory](core-module-inventory.md) for the current implementation and verification. The three-module record below documents the first delivery and is superseded where scope expanded.

## First delivery history

Reference checkout: `D:/workspace/codexsun`. Initial scope: Company, Financial Year and Contact. This app adapts their field model and behavior to the current Codebiz architecture; it does not vendor the old monorepo runtime or import its database records.

## Reference sources

| Module | Backend reference | Frontend reference |
| --- | --- | --- |
| Company | `apps/core/api/src/modules/organisation/company` | `apps/core/web/src/modules/organisation/company` |
| Financial year | `apps/core/api/src/modules/organisation/financial-year` | `apps/core/web/src/modules/organisation/financial-year` |
| Contact | `apps/core/api/src/modules/master/contact` | `apps/core/web/src/modules/master/contact` |

The reference services/types were inspected for field ownership, primary email/phone, addresses, active state, unique codes, current-year restrictions and date ordering. The new implementations use explicit module services/repositories and shared Codebiz UI instead of copying the old host-specific implementation.

## Initial module contracts

| Module | Editable values | Rules |
| --- | --- | --- |
| Company | Name, code, legal name, GSTIN, PAN, website, notes, emails, phones, addresses, active | Tenant-owned; uppercase unique code; at most one primary email/phone and default address |
| Financial year | Name, start date, end date, current, active | Tenant-owned; valid date-only boundaries; end after start; unique name/date range; one current year per tenant; current year must be active |
| Contact | Company-style party values plus customer/supplier/both/other role | Tenant-owned; same unique code and contact-detail rules; roles replace a dependency on a separate Contact Type master in this delivery |

Addresses are owned value objects stored as JSONB, with explicit billing/shipping/registered/other purpose and free-text location labels. They do not pretend to resolve validated Country/State/City masters. Emails and phones are bounded arrays of value objects; internal IDs for these values are not exposed.

All three entity roots use an internal integer identity, immutable eight-character public reference stored in varchar(32), tenant, active, trusted actor and timestamp fields. Deletion fields are retained for the standard storage contract, but no delete/restore API or screen is enabled. Deactivation preserves historical references.

## Adaptation decisions

- One independent app/package and lockfile; backend and frontend remain within `src/api` and `src/web`.
- PostgreSQL/Kysely replace the reference's MariaDB implementation.
- Every leaf owns its coded migration and explicit no-data seeder. The runner only discovers and executes module files.
- APIs use `/api/v1`; screens use clean module paths and eight-character public IDs.
- UI uses the shared shell, Master List, Record Detail, Upsert Form, date/select controls and unsaved-change guard. App navigation and browser history integrate with that guard.
- Verified server configuration supplies service actor/tenant/permissions. Browser sessions have same-origin write protection. The opt-in local developer session is restricted to loopback/nonproduction; Platform identity integration is pending.
- Financial-year current selection serializes concurrent writes per tenant and has a database unique index. Its date parser preserves calendar dates instead of creating timezone timestamps.

## Deferred reference features

Bank accounts, social links, branding files/uploads, industry/contact-group/type masters, geographic hierarchies, default-company selection, external contact imports and destructive force-delete behavior are not copied into this phase. Company/year membership restrictions require a future trusted identity policy. Billing owns financial openings, allocations, tax calculations and issued-document snapshots.

This is a working local first delivery, not certification of the complete reference Core product or a production deployment.
