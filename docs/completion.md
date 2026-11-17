# Core completion and Billing handoff

All 37 Core reference modules are implemented in `apps/core-app` for local integration. Each owns its contracts, validation, PostgreSQL persistence, public APIs and shared List, Show, New and Edit screens. The [module inventory](core-module-inventory.md) maps every reference leaf to its new owner and endpoint.

## Delivered modules

- Locations: Country, State, District, City and Pincode, with validated parent relationships.
- Accounts: Ledger Group and Ledger.
- Contact references: Address Type, Bank Name, Contact Group and Contact Type.
- General references: Currency, Month, Payment Term, Priority and Sales Type.
- Product references: Brand, Colour, HSN Code, Product Category, Product Group, Product Type, Size, Style, Tax and Unit.
- Work-order references: Destination, Stock Rejection Type, Transport, Warehouse and Work Order Type.
- Masters and organisation: Company, Financial Year, Contact, Product, Work Order and Default Company.

Company and Contact include structured contact details, reference-backed addresses, bank accounts and social links. Company supports branding URLs and tax-registration fields. Product resolves unit, tax, HSN and other catalog references. All API references use public IDs; internal integer keys remain private.

## Billing interface

Core runs at `http://127.0.0.1:4406`. Billing remains unchanged at port 4401.

The read-only client now provides list/get methods for every module, plus `getCurrentDefaultCompany()` and `getOrganisationContext()`. The organisation-context endpoint returns the configured default, company and financial year under the caller's trusted tenant scope. Product DTOs include the resolved tax rate and HSN code.

Before issuing invoices, create the real Company and Financial Year and configure Default Company. The app does not create fictional companies, contacts, products or financial transactions. The common reference seed installs 348 source reference values for the explicit local-development tenant. The source's negative tax-rate sentinel is excluded.

See [Billing API integration](billing-api.md) for access-key issuance and client setup. Billing must validate active Core references and retain immutable invoice snapshots. Core catalog opening quantity/rate and contact credit limit do not establish a company/year/currency stock ledger or opening-balance workflow; Billing retains ownership of financial facts.

## Verification on 17 November 2026

- Typecheck, production build and version consistency passed; the browser build is warning-free.
- Seven authentication, client and release-tool tests passed.
- Forty-five PostgreSQL acceptance checks passed, including all 37 modules' create/read/edit/active lifecycle, tenant isolation, permissions, foreign keys, seeds and upgrade preservation.
- All 37 module lists loaded with their New action in the browser.
- New/Cancel screens were checked for Country, State, Tax, Company, Contact, Default Company and Product.
- Product was created using a live Unit lookup, edited and reloaded at a 390-pixel mobile viewport. Browser Back prompted for dirty input; Stay retained values. The viewport was restored afterward.
- The exact browser verification product was removed after testing. The 348 reference records and unrelated application records remain intact.
- The three initial migrations are preserved. Thirty-seven additive/new module migrations have been applied, for 40 total. Reference seeds are repeatable and preserve existing IDs and user-managed fields. Additive master-data downgrade refuses destructive rollback and requires reviewed recovery.

## Deployment boundary

This completes the local Core module scope and prepares its public interfaces for Billing development. Production Platform identity/tenant-membership integration, deployment and operational credential provisioning remain separate work. Local developer access remains explicitly restricted to loopback/nonproduction. Logo/file uploads are supplied by the file-owning service; Core stores validated branding URLs. Force deletion is intentionally excluded in favour of preserving references and deactivation.

List filtering, sorting and pagination use the public shared Master List over loaded records. Server pagination and query-string persistence are not claimed. The initial version remains 0.1.0; no commit, tag, push or deployment was performed in this task.
