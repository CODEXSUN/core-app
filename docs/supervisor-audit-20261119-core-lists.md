# Core master-list gateway budget audit — 2026-11-19

Status: immutable0.1.6 release-ready for CodeShip; tagged workflow44441018652 succeeded and release/image manifest was retrieved and verified. Typecheck/build,24 unit/tool checks and47 PostgreSQL checks passed locally and in tagged CI. CodeShip deployment/live audit remains separate. No migration or live data/process change by this source owner.

## Measured defect and result

The real disposable PostgreSQL fixture contains5000 contacts and5000 products with valid76/85-character commercial names. Core's own ContactPage/ProductPage called legacy loadContact/loadProduct, fetching the full ordinary collection before local MasterList processing. Actual responses: contacts3,058,894 bytes, products3,095,001 bytes. Both produced502 through the actual Platform gateway response reader, which enforces1,048,576 bytes. This is measured fixture evidence, not a hypothetical catalogue size or live production data.

New list-only100-row responses: contacts20,439 bytes, products21,247 bytes. The same actual gateway reader returned200 for both. Responses select only displayed scalar columns plus public_id/active in SQL, not full party/address/bank/description arrays. Detail/show/edit still request complete existing record DTOs separately. Original unpaged collections and Core public clients retain compatible bulk behavior without silent truncation.

## Owner implementation

All37 module repositories provide an explicit owner-scoped page query; each existing service enforces its original read permission, and each route supplies `GET /api/v1/<collection>/page`. The shared helper performs pagination/filtering only on an already tenant/deleted-scoped existing typed query and a module-local displayed-column allowlist. It contains no table/schema/entity registry or CRUD writes. Existing applied migration files, module classifications and reference constraints are unchanged.

Query: page1-based(default1,max1000000), pageSize1–100(default25), q maximum80 characters, sort allowlisted displayed-column ID, direction asc/desc, filterId active/inactive, filters JSON object of allowlisted column IDs to literal text(max12 fields,80 characters each,4096 encoded characters). Unknown keys, malformed filters, reserved prototype keys, invalid bounds/sorts/IDs are rejected400. Search/count/page all retain trusted tenant and non-deleted scope; active/inactive presets and column filters are applied before total/page. Reference-name columns map explicitly to their owner query's joined public label; boolean display uses Yes/No. Stable ordering ends with public_id ASC. Rows are projected before execution, so complete catalogue/nested payloads are not fetched merely to slice in JavaScript.

The serialized page also has an explicit1MiB response budget. A valid100-row HSN description fixture containing JSON-escaped text exceeds a row-count-only budget and returns413 with “Choose a smaller page size”; requesting10 succeeds with total100. No hidden row removal, dataset truncation or false “all records” result is used.

All37 frontend list branches now use controlled MasterList remote mode. Zero-based UI page maps to one-based HTTP page. Requests debounce text/column changes200ms, immediately clear stale rows/totals, abort superseded/unmounted work, ignore late generations, validate exact page metadata and expose same-page manual retry.401/403 never auto-loop. Detail/new/edit and old bulk service functions remain unchanged. Default Company creates no duplicate affordance from a filtered empty page. List-row Pick types contain only actual displayed fields. Remote CSV export is intentionally unavailable until an explicit bounded page/all-matching export implementation is supplied; no page is mislabeled as an entire-dataset export.

## Verification

- All37 real SQL page paths tested for auth, foreign-tenant totals, bounded size, search, status filters and unknown sort/filter denial. All37 service factories reject missing owning read permissions before SQL.
- Real5000+5000 fixture verifies beyond-page-one search, exact role/tenant/count bounds, selected foreign/inactive/deleted IDs, inactive reference/currency semantics, stable duplicate names and old bulk compatibility. Actual gateway reader accepted the new desk pages and rejected old full collections.
- Six frontend request-controller behavior checks cover server order/intent, synchronous clearing, cancellation/latest response, debounce/unmount,503 same-page retry,401/403 behavior, invalid/oversized metadata and StrictMode cleanup/restart.
- Parser regression found that Zod record parsing discarded a reserved prototype key before an ordinary allowlist check. Raw filter keys are now rejected before record parsing; all24 unit/tool tests pass.
- Complete47 PostgreSQL checks pass, including migration upgrade/seed identity preservation, refused destructive rollback, startup recovery and the heavy catalogue fixture. CI0.1.5 already ran the SQL suite successfully;0.1.6 retains that release gate.

Pins: framework0.2.0 `51daaa2a7bee32d0a8eca806a2b0e8a765a3e1ac`, UI0.1.13 `984a9d2afd4dcfdc80bd1f940c9a94cb0dff298b`, SDK0.1.6 `cfcb231fee23a2cb9920beaffee3140b8cf8b355`. Public UI's actual viewport/controller evidence is owned by its pagination report; Core app-specific live screenshots and end-to-end heavy-user latency remain post-deployment checks. This is not a blanket production100-user certification or a guarantee for legacy bulk callers, unconverted form reference pickers, exports or every deployment host.

CodeShip alone deploys after immutable tag/workflow/manifest approval; Core0.1.5 and Billing's consuming release remain separate ordered lanes. Preserve identities, application grants, tenant/company policies, writer data and native processes. No fresh/reset/seed or schema downgrade is authorized by this source change.

## Verified release

Tagv-0.1.6, commit28bac4d4fac100d50592dbf9feb5b4cac34e4fe4. [Successful workflow44441018652](https://github.com/CODEXSUN/core-app/actions/runs/44441018652); [immutable GitHub release](https://github.com/CODEXSUN/core-app/releases/tag/v-0.1.6).

Image ghcr.io/codexsun/core-app@sha256:e98794ee7ae8190ea81e9edafe2b4b0656af746fdbdd24fd9531372aa97f1596. Manifest image ID matches sha256:e98794ee7ae8190ea81e9edafe2b4b0656af746fdbdd24fd9531372aa97f1596; archive SHA25698a4d301f26c068c4bac5be9130f82759a6bb7f504bd650044a7f29be82aafd7. All40migrationhashes remain unchanged; actual installed history must still be checked by CodeShip. This includes the prior0.1.5 bounded Billing contracts, so CodeShip may deploy0.1.6 directly before consuming Billing rather than install an unnecessary interim image. Native source checkout is synchronized with published release code; unrelated historical work-record notes remain preserved.
