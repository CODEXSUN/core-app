# Core backend verification — 20 November 2026

Status: source candidate, not published or deployed. Company, financial year,
default company, contacts, products, work orders and all common/master modules
remain owned by Core. Billing uses the public Core client.

## Fields and columns

[Field inventory](backend-field-inventory.md) contains all 37 native modules,
521 physical columns, editable/returned API fields and the exact Codexsun field
comparison. The captured source evidence is
`tests/fixtures/codexsun-core-fields.json`, including hashes and nested types.
Exact name matching is not a claim of identical types or persistence layout.

Compatibility differences requiring explicit treatment during old-data import:

| Codexsun | Native workspace treatment |
| --- | --- |
| Integer public `id`, sometimes `uuid` | Eight-character `public_id`; internal integer IDs remain private |
| `status`, `isActive`, `deletedAt` | `active`, `deleted_at`, `deleted_by`; no silent legacy status acceptance |
| `createdAt`, `updatedAt` | Trusted snake_case audit fields and actors |
| Contact `openingBalance` | Billing opening balance scoped to company, year, party role and currency |
| Nested child numeric IDs and `sortOrder` | JSON value objects with array order; no independent numeric child identities |
| Email/phone `emailType`, `phoneType` | Native `label` |
| Geographic display names | Native address `country`, `state`, `city`, `postalCode`; public geographic reference IDs validated through their owners |
| Derived `primaryPhone`, `primaryEmail` | Derived from primary child entries |
| Child district display name / social legacy status | Not literal native fields; require reviewed import mapping |
| District `countryId`/`countryName`; City `stateId`/`stateName`/`countryId`/`countryName` | Native records expose their immediate parent; obtain ancestry through shared location APIs |
| Company `logoPath`, `logoDarkPath`, `faviconPath` | Native `logoUrl`, `logoDarkUrl`, `faviconUrl`; old filesystem paths require an explicit asset migration |
| Company `industryId` | Native `industryName` text; no independent industry catalogue relationship implemented |
| Default-company `companyCode`, `financialYearStartDate`, `financialYearEndDate` | Available from selected Company/FinancialYear public records, not duplicated on default-company response |

The native API is intentionally strict. Missing exact-name cells in the inventory
are not silently treated as migrated fields. This task does not import existing
client records or certify an old-MySQL-to-native data migration.

## Backend changes

- Added permission-scoped DELETE endpoints for all 37 modules. Deletion retains
  rows, IDs and audit identity, sets `active=false`, and hides records from normal
  GET/list/page/update. Deleted IDs cannot be restored by update or recycled.
- Active Core references prevent deletion with 409, including SQL foreign keys
  and company/contact JSON address/bank references. Reference resolution uses
  shared locks; deletion takes a row lock before checking dependents.
- Deleting a current financial year clears `is_current` atomically so its
  existing database constraint remains valid. A selected default-company/year
  still blocks deletion through its live dependency.
- Existing create/update/list/get behavior and module-specific validation remain
  in their owners. No migration change was required for Core deletion columns.
- Declared 37 specific delete permissions. No actual user grants changed.

## Test matrix

| Area | Checks |
| --- | --- |
| All 37 modules | Create, update, one-record read, list/page, editable-field round trip and physical columns |
| Deletion | Hidden record, retained row/audit, repeated delete, update cannot resurrect, dependent master denial |
| JSON references | Both companies and contacts protect address and bank masters |
| Scope | Unauthenticated, insufficient permission, other tenant, invalid/missing public IDs |
| Concurrency | Parent delete against referencing child creation; only one succeeds |
| Setup | Current-year deletion, tenant-safe default selections, seeds and upgrade recovery |

Commands: `npm run typecheck`, `npm test`, `npm run test:database`.
Database suites use disposable schemas in a database explicitly ending `_test`.
No local Docker or client data is used. Results are recorded in the work record.
These checks cover the listed cases, not every theoretically possible input.
