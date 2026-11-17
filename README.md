# Core App

All 37 CODEXSUN Core modules adapted to the Codebiz standards for shared reference, organisation and business master data. See [completion and Billing handoff](docs/completion.md) and the [full module inventory](docs/core-module-inventory.md).

Agents: read [AGENTS.md](AGENTS.md) before working in this repository.

Initial development version: 0.1.0. Remote: https://github.com/CODEXSUN/core-app.git.

## Run locally

Run commands inside this repository. Use Node.js 26.13.1 or later and the existing sibling framework/UI packages.

1. Run `npm ci`.
2. Copy `.env.example` to `.env` and configure `CORE_APP_DATABASE_URL` for a dedicated PostgreSQL database.
3. Run `npm run db:status`, then explicitly run `npm run db:migrate`.
4. Run `npm run verify` and `npm start`.
5. Open http://127.0.0.1:4340.

Local development access is opt-in: set `CORE_APP_LOCAL_ACCESS=true` only on a loopback development server. The Open local workspace action uses the fixed `local-development` tenant and `local:developer` actor. This mode is rejected in production or when bound to a public address. It is a local development identity policy, not Platform user authentication.

Production access uses administrator-configured API clients or a future trusted Platform identity adapter. Access keys bind actor, tenant and exact permissions on the server. Browser access exchanges a key for an eight-hour HttpOnly, SameSite session; browser writes require the configured exact Origin. Production sessions require an HTTPS `CORE_APP_PUBLIC_ORIGIN`. Sessions expire on server restart.

## Modules and APIs

| Module | Screens | API collection | Permission prefix |
| --- | --- | --- | --- |
| Company | `/companies` | `/api/v1/companies` | `master/company` |
| Financial year | `/financial-years` | `/api/v1/financial-years` | `master/financial-year` |
| Contact | `/contacts` | `/api/v1/contacts` | `master/contact` |

All 37 modules have List, Show, New and Edit screens. The table above highlights the original three; the complete inventory lists the remaining 34. Collection GET and record GET require `:read`; POST and PATCH require `:write`. Record paths use eight-character public IDs. POST returns 201. PATCH accepts the complete editable values object. Active/inactive lifecycle is supported; deletion and restoration are deliberately excluded to preserve references.

List search, sorting, filters and pagination use the shared Master List over the loaded tenant records. They are currently local controls; server pagination and query-string restoration are not implemented.

Authenticated API documentation is available at `/api/docs` and `/api/openapi.json`. Health probes are `/api/live`, `/api/ready` and `/api/health`. Readiness checks all 37 module tables. Startup never migrates or seeds data.

## Billing integration

See [Billing API integration](docs/billing-api.md). Billing remains unchanged in this delivery. Read-only TypeScript contracts/client for all 37 modules and organisation context are exported by this package; Billing can also call the HTTP APIs directly.

## Verification and scope

- `npm run verify`: typecheck, browser build, authentication/tool tests and version consistency.
- `npm run test:database`: uses ignored `.env.test`, requires `NODE_ENV=test` and a disposable database name ending in `_test`. Each module suite creates and removes its own schema; tests never run against application data.
- `npm run db:seed`: previews seed policy without inserting records. Use `npm run db:seed -- --tenant local-development` to install the 348 tenant-scoped reference values. No sample companies, years, contacts or transactions are created.

See [reference adaptation](docs/reference-adaptation.md), [work record](docs/work-record.md) and [changelog](docs/CHANGELOG.md). Bank accounts, social links, location masters and default-company selection are implemented. Branding uses validated URLs; file uploads use the file-owning service. Financial opening balances and credit workflows remain Billing-owned. Production identity integration and deployment are separate from the completed local module scope.

## Local web and API ports

Run `npm run dev:api` and `npm run dev:web` in separate terminals. Open http://127.0.0.1:4340; API is http://127.0.0.1:4345. The web server proxies `/api` to its API and refuses an occupied port. `npm start` serves the built app together on the API port. See [port rules](../../mcp-governance/docs/local-ports.md).
