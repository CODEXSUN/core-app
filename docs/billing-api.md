# Billing API integration

Core runs independently at `http://127.0.0.1:4340` in local development. Billing keeps its own server on port 4401 and calls Core from its backend. This delivery does not modify Billing or share database access.

## Authentication

Core administrators configure `CORE_APP_API_CLIENTS` privately as a JSON array. Each entry contains a SHA-256 token hash, trusted actor ID, trusted tenant ID and exact permission strings. Raw keys belong only in the caller's private server settings. Core ignores client-supplied actor, tenant and permission headers.

For initial local integration, run:

```text
npm run client:create -- --tenant local-development --actor service:billing
```

This creates a read-only client for all 37 modules, updates ignored `.env` and writes the raw credential only into ignored `.env.billing-client`. It prints no credential, refuses an existing output file/client and requires a Core restart to activate. Transfer those private settings into Billing's server environment; never commit the file or put its key in browser code. For other tenants, use the tenant identity verified by your provisioning process.

The helper uses the local Core address in its output. Set the correct HTTPS Core origin when configuring a deployed caller. Production identity provisioning, rotation and deployment remain explicit operational tasks.

## Public read contract

| Operation | Request | Required permission |
| --- | --- | --- |
| List companies | `GET /api/v1/companies` | `master/company:read` |
| Get company | `GET /api/v1/companies/{publicId}` | `master/company:read` |
| List financial years | `GET /api/v1/financial-years` | `master/financial-year:read` |
| Get financial year | `GET /api/v1/financial-years/{publicId}` | `master/financial-year:read` |
| List contacts | `GET /api/v1/contacts` | `master/contact:read` |
| Get contact | `GET /api/v1/contacts/{publicId}` | `master/contact:read` |

Send `Authorization: Bearer <private key>`. The credential determines the tenant; passing another tenant header cannot expand scope. List responses are arrays and include active and inactive visible records. Record responses contain domain fields, `public_id`, creation/update times and trusted actor references. Internal integer IDs and tenant/database fields are not returned. Dates use `yyyy-MM-dd`; audit timestamps use ISO date-time strings.

Responses distinguish 400 invalid values/ID, 401 unauthenticated, 403 missing permission, 404 unknown/inaccessible record, 409 duplicate/conflicting values and 503 unavailable storage. A missing record in another tenant also returns 404. No cross-origin browser access or CORS credentials are enabled.

## Optional TypeScript client

The package exports `@workspace/core-app/client` and each module's types through `@workspace/core-app/contracts/company`, `/contracts/financial-year` and `/contracts/contact`. Configure the independent package dependency explicitly before using these imports in Billing; do not import Core's private source or repositories.

```ts
import { createCoreClient } from '@workspace/core-app/client';

const core = createCoreClient({
  baseUrl: process.env.CORE_API_URL!,
  token: process.env.CORE_API_TOKEN!,
});
const companies = await core.listCompanies();
const contact = await core.getContact(selectedContactPublicId);
```

The client supplies list/get operations for every module, organisation-context/default-company reads and a five-second timeout. It never accepts a tenant override and throws on failed requests. Retry policy and user-facing failure recovery remain Billing-owned.

## Billing validation rules

Before saving a new invoice or allocation, validate the selected Core records under the appropriate trusted tenant access. Check company, financial-year and contact active state and the contact role. Keep public references to Core records and save immutable invoice snapshots of names, addresses and tax details. Master edits must not rewrite issued invoices.

Contacts are tenant-wide; they can serve more than one company. Financial years are tenant-wide calendar periods with at most one current active year per tenant. Default Company selects the company and financial year for this tenant. Accounting close/lock remains Billing-owned. A contact's opening balance is intentionally absent: financial openings require Billing's company/year/currency ownership.

## Expanded Core interface

See the [37-module inventory](core-module-inventory.md) for every collection and permission prefix. Each exposes GET collection and GET public-ID reads. Product responses additionally resolve taxRate and hsnCode.

GET /api/v1/default-companies/current requires master/default-company:read. GET /api/v1/organisation-context requires that permission plus master/company:read and master/financial-year:read; it returns defaults, company and financialYear without internal IDs. An unconfigured tenant receives 404. Configure actual company/year records and Default Company before using Billing.

Common reference data, including units and currencies, is installed through an explicit scoped seed command. Source placeholders are excluded except the protected technical hyphen unit; the negative tax-rate sentinel is never installed.
