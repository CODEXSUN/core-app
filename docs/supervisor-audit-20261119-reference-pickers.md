# Core reference-picker follow-up — 2026-11-19

Status: implemented for fresh 0.1.7; publication and selected deployment are pending. Core 0.1.6 is independently deployed and its immutable tag remains unchanged.

ProductForm still performs seven eager full foreign collection reads in Promise.all. A separate real disposable35,000-row PostgreSQL fixture(5000 rows in each foreign catalogue, valid71-character names) measured:

| Foreign collection | Bulk bytes | Existing25-row page bytes | Actual gateway bulk result |
| --- | ---: | ---: | --- |
| product-types |1,350,001 |3,396 |502 |
| product-categories |1,350,001 |3,396 |502 |
| product-groups |1,350,001 |3,396 |502 |
| hsn-codes |1,678,894 |4,987 |502 |
| units |1,350,001 |3,396 |502 |
| taxes |1,704,002 |5,146 |502 |
| brands |1,605,001 |4,671 |502 |

Total full-reference response bytes10,387,901. Each failure was reproduced with the actual Platform byte reader on ephemeral HTTP fixtures with synthetic authority, not live tenant data. Dedicated schema was removed by the test harness. The first tax fixture draft hit the existing per-tenant unique tax-rate constraint; corrected fixture uses5000 distinct valid0.01–50.00 rates and then passed. This was a fixture construction error, not a production defect.

The proposed app-owned bounded reference picker uses public shared Dialog/controlled remote MasterList, module-owned typed loadPage/getSelected callbacks, default25/max100 server rows, exact totals/search, abort/generation guards and no global cache. Empty New forms should not fetch seven full catalogues. Existing selected IDs resolve through single-record reads; inactive historical labels remain visible but inactive rows are not newly selectable. Existing foreign read rights and backend write/reference validation remain authoritative. Static enum/free-text controls stay local. Ordinary relationship-backed forms repeat the same eager loader pattern and should adopt the adapter consistently.

Compatibility gap requiring a narrow owner decision before implementation: AddressReferences currently exact-filters states.countryId/districts.stateId/cities.districtId/pincodes.cityId. Existing list pages expose displayed parent names and contains-text column filters, not an exact parent public-ID constraint. UI-only conversion cannot preserve exact cascade filtering/totals by silently filtering a server page or scanning every page. Do not weaken this constraint. Either authorize a small additive owner-scoped exact-reference query before count/page or leave that cascade helper explicitly unconverted until its contract exists. No schema rewrite or migration is needed merely to paginate the known fields.

## Implemented contract and verification

Eight ordinary forms (16 relationship fields), shared bank references and address cascades now use the app-owned Dialog/remote Master List picker. New forms make no eager foreign-catalogue reads. Pages default to 25, maximum 100; selected records use existing single GETs. Historical inactive labels remain visible, while choice pages require active records. Existing read permissions, schemas and fresh save validation are preserved. Request aborts, generation guards and scope resets prevent stale parent selections; there is no global cache.

The owner-authorized narrow additive `references` JSON query supports exact public IDs on states.countryId, districts.stateId, cities.districtId and pincodes.cityId. It validates at most four eight-character IDs, verifies the parent through its existing scoped resolver/read permission, and applies equality before text filtering, count and paging. Unknown/invalid keys fail 400; foreign/inactive parents fail closed. Existing text filters and bulk APIs remain unchanged. No migration or schema change.

Verification: 32 unit/tool tests and 49 disposable PostgreSQL checks passed, including the 35,000-row measured fixture and exact cascades across tenants, totals, parent changes, permission denial and inactive history. The PostgreSQL suite is included in tagged CI.

Actual Product New/Edit, Contact New and Company New/Edit forms were browser-tested against frozen published UI 0.1.13 (984a9d2afd4dcfdc80bd1f940c9a94cb0dff298b), with synthetic 5,000-item HTTP catalogues: zero eager requests even after adding address/bank rows; 25-row responses at most 2,146 bytes; beyond-page search, off-page/inactive labels, schema validation, 403 denial, manual 503 recovery and cancellation passed. Changing Company country cleared dependent IDs and aborted the selected-state and previous-parent page requests; three HTTP aborts were observed. Document widths matched 360/768/1440 viewports; Dialog widths were 328/736/896. Mobile layout was visually reviewed. These browser fixtures test rendering/transport behavior, not live authentication or production throughput.

Evidence is retained in docs/evidence/core-reference-browser-evidence.json and viewport screenshots. Unrelated concurrent Zetro home-page integration is excluded from this release; pinned published framework/UI/SDK remain unchanged.
