# Core module implementation scope

All 37 reference leaves are authorized for adaptation. Source: D:/workspace/codexsun/apps/core. Public IDs, tenant scope, standard fields and PostgreSQL replace legacy integer API IDs and MariaDB. Financial openings remain Billing-owned; source customer data is not copied.

Each leaf supplies List, Show, New/Edit, GET/POST/PATCH and active/inactive lifecycle. Force deletion is excluded to preserve historical references. Common and master classification follows the current governance.

| Module | Reference module | Owning module | Collection API |
| --- | --- | --- | --- |
| Countries | common/location/country | common/country | /api/v1/countries |
| States | common/location/state | common/state | /api/v1/states |
| Districts | common/location/district | common/district | /api/v1/districts |
| Cities | common/location/city | common/city | /api/v1/cities |
| Pincodes | common/location/pincode | common/pincode | /api/v1/pincodes |
| Ledger Groups | common/accounts/ledger-groups | common/ledger-group | /api/v1/ledger-groups |
| Ledgers | common/accounts/ledgers | common/ledger | /api/v1/ledgers |
| Address Types | common/contacts/address-types | common/address-type | /api/v1/address-types |
| Bank Names | common/contacts/bank-names | common/bank-name | /api/v1/bank-names |
| Contact Groups | common/contacts/contact-groups | common/contact-group | /api/v1/contact-groups |
| Contact Types | common/contacts/contact-types | common/contact-type | /api/v1/contact-types |
| Currencies | common/others/currencies | common/currency | /api/v1/currencies |
| Months | common/others/months | common/month | /api/v1/months |
| Payment Terms | common/others/payment-terms | common/payment-term | /api/v1/payment-terms |
| Priorities | common/others/priorities | common/priority | /api/v1/priorities |
| Sales Types | common/others/sales-types | common/sales-type | /api/v1/sales-types |
| Brands | common/products/brands | common/brand | /api/v1/brands |
| Colours | common/products/colours | common/colour | /api/v1/colours |
| Hsn Codes | common/products/hsn-codes | common/hsn-code | /api/v1/hsn-codes |
| Product Categories | common/products/product-categories | common/product-category | /api/v1/product-categories |
| Product Groups | common/products/product-groups | common/product-group | /api/v1/product-groups |
| Product Types | common/products/product-types | common/product-type | /api/v1/product-types |
| Sizes | common/products/sizes | common/size | /api/v1/sizes |
| Styles | common/products/styles | common/style | /api/v1/styles |
| Taxes | common/products/taxes | common/tax | /api/v1/taxes |
| Units | common/products/units | common/unit | /api/v1/units |
| Destinations | common/workorder/destinations | common/destination | /api/v1/destinations |
| Stock Rejection Types | common/workorder/stock-rejection-types | common/stock-rejection-type | /api/v1/stock-rejection-types |
| Transports | common/workorder/transports | common/transport | /api/v1/transports |
| Warehouses | common/workorder/warehouses | common/warehouse | /api/v1/warehouses |
| Work Order Types | common/workorder/work-order-types | common/work-order-type | /api/v1/work-order-types |
| Companies | organisation/company | master/company | /api/v1/companies |
| Financial Years | organisation/financial-year | master/financial-year | /api/v1/financial-years |
| Contacts | master/contact | master/contact | /api/v1/contacts |
| Products | master/product | master/product | /api/v1/products |
| Work Orders | master/work-order | master/work-order | /api/v1/work-orders |
| Default Companies | organisation/default-company | master/default-company | /api/v1/default-companies |

Reference validation, relationships and seed policies are adapted per module; a module is not verified merely because its files exist.
