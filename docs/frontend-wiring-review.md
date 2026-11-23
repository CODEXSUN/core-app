# Core frontend connections — 20 November 2026

All 37 native module lists, detail pages and edit forms remain connected to their
own Core APIs. Company, financial year, default company and shared common/master
records remain authoritative here; Billing does not copy these tables.

Added permission-specific deletion from each module's detail header, using shared
UI confirmation controls and the existing Platform transport. Live-reference
conflicts remain visible in the dialog. Successful deletion returns to the list.
The existing read/write permission checks and unsaved-form protection remain.

Production-bundle acceptance connected to disposable PostgreSQL schemas passes
all 37 list/edit/save flows, visible referenced-master denial, and successful
unreferenced deletion: 38 passing test results. Typecheck, production build,
45 unit/tool tests and 91 PostgreSQL tests pass. The simulated test browser supplies
Web Locks required by the current shared SDK; production security is unchanged.

The migration fixture blocker was fixed by resolving the current schema and
passing it explicitly to Kysely migration bookkeeping. Historical migrations and
runtime databases are unchanged.

Old Codexsun child IDs/status fields, asset paths, industry relationship and
other native-model differences remain listed in backend-verification.md for
one-by-one review. These checks do not claim old-client-data import, frozen-tag
release certification or live Platform/Docker acceptance.

Source version remains 0.1.7. No publication, grants, runtime migrations or
deployment. The Docker hold and Ubuntu stop remain in force.
