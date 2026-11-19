# Core reference-picker follow-up — 2026-11-19

Status: actual defect measured; fresh0.1.7 implementation authorized, planning scope/compatibility before runtime changes. Core0.1.6 is deployed separately and its immutable tag remains unchanged.

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
