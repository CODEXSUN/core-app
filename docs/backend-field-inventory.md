# Core backend field and column inventory

Exact name compares spelling only. Blank native cells have no identically named returned field. Public ID, storage and lifecycle differences are explained in backend-verification.md. SQL columns below were read from a disposable PostgreSQL schema.

## common/country

Table: `countries`; collection: `/api/v1/countries`.

Editable: `name`, `code`, `sortOrder`, `active`.

Returned: `public_id`, `name`, `active`, `created_at`, `updated_at`, `created_by`, `updated_by`, `code`, `sortOrder`.

Codexsun `Country`:

| Codexsun field | Native field | Exact name |
| --- | --- | --- |
| `id` |  | No |
| `code` | `code` | Yes |
| `name` | `name` | Yes |
| `sortOrder` | `sortOrder` | Yes |
| `status` |  | No |

| SQL column | PostgreSQL type | Nullable |
| --- | --- | --- |
| `id` | integer | NO |
| `public_id` | character varying | NO |
| `tenant_id` | character varying | NO |
| `name` | character varying | NO |
| `code` | character varying | NO |
| `sort_order` | integer | NO |
| `active` | boolean | NO |
| `created_at` | timestamp with time zone | NO |
| `updated_at` | timestamp with time zone | NO |
| `created_by` | character varying | NO |
| `updated_by` | character varying | NO |
| `deleted_at` | timestamp with time zone | YES |
| `deleted_by` | character varying | YES |

## common/state

Table: `states`; collection: `/api/v1/states`.

Editable: `name`, `countryId`, `code`, `sortOrder`, `active`.

Returned: `public_id`, `name`, `active`, `created_at`, `updated_at`, `created_by`, `updated_by`, `code`, `sortOrder`, `countryId`, `countryName`.

Codexsun `State`:

| Codexsun field | Native field | Exact name |
| --- | --- | --- |
| `id` |  | No |
| `countryId` | `countryId` | Yes |
| `countryName` | `countryName` | Yes |
| `code` | `code` | Yes |
| `name` | `name` | Yes |
| `sortOrder` | `sortOrder` | Yes |
| `status` |  | No |

| SQL column | PostgreSQL type | Nullable |
| --- | --- | --- |
| `id` | integer | NO |
| `public_id` | character varying | NO |
| `tenant_id` | character varying | NO |
| `name` | character varying | NO |
| `country_id` | integer | YES |
| `code` | character varying | NO |
| `sort_order` | integer | NO |
| `active` | boolean | NO |
| `created_at` | timestamp with time zone | NO |
| `updated_at` | timestamp with time zone | NO |
| `created_by` | character varying | NO |
| `updated_by` | character varying | NO |
| `deleted_at` | timestamp with time zone | YES |
| `deleted_by` | character varying | YES |

## common/district

Table: `districts`; collection: `/api/v1/districts`.

Editable: `name`, `stateId`, `sortOrder`, `active`.

Returned: `public_id`, `name`, `active`, `created_at`, `updated_at`, `created_by`, `updated_by`, `sortOrder`, `stateId`, `stateName`.

Codexsun `District`:

| Codexsun field | Native field | Exact name |
| --- | --- | --- |
| `id` |  | No |
| `stateId` | `stateId` | Yes |
| `stateName` | `stateName` | Yes |
| `countryId` |  | No |
| `countryName` |  | No |
| `name` | `name` | Yes |
| `sortOrder` | `sortOrder` | Yes |
| `status` |  | No |

| SQL column | PostgreSQL type | Nullable |
| --- | --- | --- |
| `id` | integer | NO |
| `public_id` | character varying | NO |
| `tenant_id` | character varying | NO |
| `name` | character varying | NO |
| `state_id` | integer | YES |
| `sort_order` | integer | NO |
| `active` | boolean | NO |
| `created_at` | timestamp with time zone | NO |
| `updated_at` | timestamp with time zone | NO |
| `created_by` | character varying | NO |
| `updated_by` | character varying | NO |
| `deleted_at` | timestamp with time zone | YES |
| `deleted_by` | character varying | YES |

## common/city

Table: `cities`; collection: `/api/v1/cities`.

Editable: `name`, `districtId`, `sortOrder`, `active`.

Returned: `public_id`, `name`, `active`, `created_at`, `updated_at`, `created_by`, `updated_by`, `sortOrder`, `districtId`, `districtName`.

Codexsun `City`:

| Codexsun field | Native field | Exact name |
| --- | --- | --- |
| `id` |  | No |
| `districtId` | `districtId` | Yes |
| `districtName` | `districtName` | Yes |
| `stateId` |  | No |
| `stateName` |  | No |
| `countryId` |  | No |
| `countryName` |  | No |
| `name` | `name` | Yes |
| `sortOrder` | `sortOrder` | Yes |
| `status` |  | No |

| SQL column | PostgreSQL type | Nullable |
| --- | --- | --- |
| `id` | integer | NO |
| `public_id` | character varying | NO |
| `tenant_id` | character varying | NO |
| `name` | character varying | NO |
| `district_id` | integer | YES |
| `sort_order` | integer | NO |
| `active` | boolean | NO |
| `created_at` | timestamp with time zone | NO |
| `updated_at` | timestamp with time zone | NO |
| `created_by` | character varying | NO |
| `updated_by` | character varying | NO |
| `deleted_at` | timestamp with time zone | YES |
| `deleted_by` | character varying | YES |

## common/pincode

Table: `pincodes`; collection: `/api/v1/pincodes`.

Editable: `name`, `cityId`, `area`, `sortOrder`, `active`.

Returned: `public_id`, `name`, `active`, `created_at`, `updated_at`, `created_by`, `updated_by`, `area`, `sortOrder`, `cityId`, `cityName`.

Codexsun `Pincode`:

| Codexsun field | Native field | Exact name |
| --- | --- | --- |
| `id` |  | No |
| `cityId` | `cityId` | Yes |
| `name` | `name` | Yes |
| `area` | `area` | Yes |
| `sortOrder` | `sortOrder` | Yes |
| `status` |  | No |

| SQL column | PostgreSQL type | Nullable |
| --- | --- | --- |
| `id` | integer | NO |
| `public_id` | character varying | NO |
| `tenant_id` | character varying | NO |
| `name` | character varying | NO |
| `city_id` | integer | YES |
| `area` | character varying | NO |
| `sort_order` | integer | NO |
| `active` | boolean | NO |
| `created_at` | timestamp with time zone | NO |
| `updated_at` | timestamp with time zone | NO |
| `created_by` | character varying | NO |
| `updated_by` | character varying | NO |
| `deleted_at` | timestamp with time zone | YES |
| `deleted_by` | character varying | YES |

## common/ledger-group

Table: `ledger_groups`; collection: `/api/v1/ledger-groups`.

Editable: `name`, `sortOrder`, `active`.

Returned: `public_id`, `name`, `active`, `created_at`, `updated_at`, `created_by`, `updated_by`, `sortOrder`.

| SQL column | PostgreSQL type | Nullable |
| --- | --- | --- |
| `id` | integer | NO |
| `public_id` | character varying | NO |
| `tenant_id` | character varying | NO |
| `name` | character varying | NO |
| `sort_order` | integer | NO |
| `active` | boolean | NO |
| `created_at` | timestamp with time zone | NO |
| `updated_at` | timestamp with time zone | NO |
| `created_by` | character varying | NO |
| `updated_by` | character varying | NO |
| `deleted_at` | timestamp with time zone | YES |
| `deleted_by` | character varying | YES |

## common/ledger

Table: `ledgers`; collection: `/api/v1/ledgers`.

Editable: `name`, `ledgerGroupId`, `sortOrder`, `active`.

Returned: `public_id`, `name`, `active`, `created_at`, `updated_at`, `created_by`, `updated_by`, `sortOrder`, `ledgerGroupId`, `ledgerGroupName`.

Codexsun `LedgerRecord`:

| Codexsun field | Native field | Exact name |
| --- | --- | --- |
| `id` |  | No |
| `ledgerGroupId` | `ledgerGroupId` | Yes |
| `ledgerGroupName` | `ledgerGroupName` | Yes |
| `name` | `name` | Yes |
| `status` |  | No |

| SQL column | PostgreSQL type | Nullable |
| --- | --- | --- |
| `id` | integer | NO |
| `public_id` | character varying | NO |
| `tenant_id` | character varying | NO |
| `name` | character varying | NO |
| `ledger_group_id` | integer | YES |
| `sort_order` | integer | NO |
| `active` | boolean | NO |
| `created_at` | timestamp with time zone | NO |
| `updated_at` | timestamp with time zone | NO |
| `created_by` | character varying | NO |
| `updated_by` | character varying | NO |
| `deleted_at` | timestamp with time zone | YES |
| `deleted_by` | character varying | YES |

## common/address-type

Table: `address_types`; collection: `/api/v1/address-types`.

Editable: `name`, `sortOrder`, `active`.

Returned: `public_id`, `name`, `active`, `created_at`, `updated_at`, `created_by`, `updated_by`, `sortOrder`.

Codexsun `AddressTypesRecord`:

| Codexsun field | Native field | Exact name |
| --- | --- | --- |
| `id` |  | No |
| `name` | `name` | Yes |
| `isActive` |  | No |
| `sortOrder` | `sortOrder` | Yes |

| SQL column | PostgreSQL type | Nullable |
| --- | --- | --- |
| `id` | integer | NO |
| `public_id` | character varying | NO |
| `tenant_id` | character varying | NO |
| `name` | character varying | NO |
| `sort_order` | integer | NO |
| `active` | boolean | NO |
| `created_at` | timestamp with time zone | NO |
| `updated_at` | timestamp with time zone | NO |
| `created_by` | character varying | NO |
| `updated_by` | character varying | NO |
| `deleted_at` | timestamp with time zone | YES |
| `deleted_by` | character varying | YES |

## common/bank-name

Table: `bank_names`; collection: `/api/v1/bank-names`.

Editable: `name`, `sortOrder`, `active`.

Returned: `public_id`, `name`, `active`, `created_at`, `updated_at`, `created_by`, `updated_by`, `sortOrder`.

Codexsun `BankNamesRecord`:

| Codexsun field | Native field | Exact name |
| --- | --- | --- |
| `id` |  | No |
| `name` | `name` | Yes |
| `isActive` |  | No |
| `sortOrder` | `sortOrder` | Yes |

| SQL column | PostgreSQL type | Nullable |
| --- | --- | --- |
| `id` | integer | NO |
| `public_id` | character varying | NO |
| `tenant_id` | character varying | NO |
| `name` | character varying | NO |
| `sort_order` | integer | NO |
| `active` | boolean | NO |
| `created_at` | timestamp with time zone | NO |
| `updated_at` | timestamp with time zone | NO |
| `created_by` | character varying | NO |
| `updated_by` | character varying | NO |
| `deleted_at` | timestamp with time zone | YES |
| `deleted_by` | character varying | YES |

## common/contact-group

Table: `contact_groups`; collection: `/api/v1/contact-groups`.

Editable: `name`, `sortOrder`, `active`.

Returned: `public_id`, `name`, `active`, `created_at`, `updated_at`, `created_by`, `updated_by`, `sortOrder`.

Codexsun `ContactGroupsRecord`:

| Codexsun field | Native field | Exact name |
| --- | --- | --- |
| `id` |  | No |
| `name` | `name` | Yes |
| `isActive` |  | No |
| `sortOrder` | `sortOrder` | Yes |

| SQL column | PostgreSQL type | Nullable |
| --- | --- | --- |
| `id` | integer | NO |
| `public_id` | character varying | NO |
| `tenant_id` | character varying | NO |
| `name` | character varying | NO |
| `sort_order` | integer | NO |
| `active` | boolean | NO |
| `created_at` | timestamp with time zone | NO |
| `updated_at` | timestamp with time zone | NO |
| `created_by` | character varying | NO |
| `updated_by` | character varying | NO |
| `deleted_at` | timestamp with time zone | YES |
| `deleted_by` | character varying | YES |

## common/contact-type

Table: `contact_types`; collection: `/api/v1/contact-types`.

Editable: `name`, `sortOrder`, `active`.

Returned: `public_id`, `name`, `active`, `created_at`, `updated_at`, `created_by`, `updated_by`, `sortOrder`.

Codexsun `ContactTypesRecord`:

| Codexsun field | Native field | Exact name |
| --- | --- | --- |
| `id` |  | No |
| `name` | `name` | Yes |
| `isActive` |  | No |
| `sortOrder` | `sortOrder` | Yes |

| SQL column | PostgreSQL type | Nullable |
| --- | --- | --- |
| `id` | integer | NO |
| `public_id` | character varying | NO |
| `tenant_id` | character varying | NO |
| `name` | character varying | NO |
| `sort_order` | integer | NO |
| `active` | boolean | NO |
| `created_at` | timestamp with time zone | NO |
| `updated_at` | timestamp with time zone | NO |
| `created_by` | character varying | NO |
| `updated_by` | character varying | NO |
| `deleted_at` | timestamp with time zone | YES |
| `deleted_by` | character varying | YES |

## common/currency

Table: `currencies`; collection: `/api/v1/currencies`.

Editable: `name`, `symbol`, `sortOrder`, `active`.

Returned: `public_id`, `name`, `active`, `created_at`, `updated_at`, `created_by`, `updated_by`, `symbol`, `sortOrder`.

Codexsun `CurrenciesRecord`:

| Codexsun field | Native field | Exact name |
| --- | --- | --- |
| `id` |  | No |
| `name` | `name` | Yes |
| `symbol` | `symbol` | Yes |
| `isActive` |  | No |
| `sortOrder` | `sortOrder` | Yes |

| SQL column | PostgreSQL type | Nullable |
| --- | --- | --- |
| `id` | integer | NO |
| `public_id` | character varying | NO |
| `tenant_id` | character varying | NO |
| `name` | character varying | NO |
| `symbol` | character varying | NO |
| `sort_order` | integer | NO |
| `active` | boolean | NO |
| `created_at` | timestamp with time zone | NO |
| `updated_at` | timestamp with time zone | NO |
| `created_by` | character varying | NO |
| `updated_by` | character varying | NO |
| `deleted_at` | timestamp with time zone | YES |
| `deleted_by` | character varying | YES |

## common/month

Table: `months`; collection: `/api/v1/months`.

Editable: `name`, `startDate`, `endDate`, `sortOrder`, `active`.

Returned: `public_id`, `name`, `active`, `created_at`, `updated_at`, `created_by`, `updated_by`, `startDate`, `endDate`, `sortOrder`.

Codexsun `MonthsRecord`:

| Codexsun field | Native field | Exact name |
| --- | --- | --- |
| `id` |  | No |
| `name` | `name` | Yes |
| `startDate` | `startDate` | Yes |
| `endDate` | `endDate` | Yes |
| `isActive` |  | No |
| `sortOrder` | `sortOrder` | Yes |

| SQL column | PostgreSQL type | Nullable |
| --- | --- | --- |
| `id` | integer | NO |
| `public_id` | character varying | NO |
| `tenant_id` | character varying | NO |
| `name` | character varying | NO |
| `start_date` | date | NO |
| `end_date` | date | NO |
| `sort_order` | integer | NO |
| `active` | boolean | NO |
| `created_at` | timestamp with time zone | NO |
| `updated_at` | timestamp with time zone | NO |
| `created_by` | character varying | NO |
| `updated_by` | character varying | NO |
| `deleted_at` | timestamp with time zone | YES |
| `deleted_by` | character varying | YES |

## common/payment-term

Table: `payment_terms`; collection: `/api/v1/payment-terms`.

Editable: `name`, `sortOrder`, `active`.

Returned: `public_id`, `name`, `active`, `created_at`, `updated_at`, `created_by`, `updated_by`, `sortOrder`.

Codexsun `PaymentTermsRecord`:

| Codexsun field | Native field | Exact name |
| --- | --- | --- |
| `id` |  | No |
| `name` | `name` | Yes |
| `isActive` |  | No |
| `sortOrder` | `sortOrder` | Yes |

| SQL column | PostgreSQL type | Nullable |
| --- | --- | --- |
| `id` | integer | NO |
| `public_id` | character varying | NO |
| `tenant_id` | character varying | NO |
| `name` | character varying | NO |
| `sort_order` | integer | NO |
| `active` | boolean | NO |
| `created_at` | timestamp with time zone | NO |
| `updated_at` | timestamp with time zone | NO |
| `created_by` | character varying | NO |
| `updated_by` | character varying | NO |
| `deleted_at` | timestamp with time zone | YES |
| `deleted_by` | character varying | YES |

## common/priority

Table: `priorities`; collection: `/api/v1/priorities`.

Editable: `name`, `colour`, `tag`, `sortOrder`, `active`.

Returned: `public_id`, `name`, `active`, `created_at`, `updated_at`, `created_by`, `updated_by`, `colour`, `tag`, `sortOrder`.

Codexsun `PrioritiesRecord`:

| Codexsun field | Native field | Exact name |
| --- | --- | --- |
| `id` |  | No |
| `name` | `name` | Yes |
| `colour` | `colour` | Yes |
| `tag` | `tag` | Yes |
| `isActive` |  | No |
| `sortOrder` | `sortOrder` | Yes |

| SQL column | PostgreSQL type | Nullable |
| --- | --- | --- |
| `id` | integer | NO |
| `public_id` | character varying | NO |
| `tenant_id` | character varying | NO |
| `name` | character varying | NO |
| `colour` | character varying | NO |
| `tag` | character varying | NO |
| `sort_order` | integer | NO |
| `active` | boolean | NO |
| `created_at` | timestamp with time zone | NO |
| `updated_at` | timestamp with time zone | NO |
| `created_by` | character varying | NO |
| `updated_by` | character varying | NO |
| `deleted_at` | timestamp with time zone | YES |
| `deleted_by` | character varying | YES |

## common/sales-type

Table: `sales_types`; collection: `/api/v1/sales-types`.

Editable: `name`, `description`, `sortOrder`, `active`.

Returned: `public_id`, `name`, `active`, `created_at`, `updated_at`, `created_by`, `updated_by`, `description`, `sortOrder`.

Codexsun `SalesTypesRecord`:

| Codexsun field | Native field | Exact name |
| --- | --- | --- |
| `id` |  | No |
| `name` | `name` | Yes |
| `description` | `description` | Yes |
| `isActive` |  | No |
| `sortOrder` | `sortOrder` | Yes |

| SQL column | PostgreSQL type | Nullable |
| --- | --- | --- |
| `id` | integer | NO |
| `public_id` | character varying | NO |
| `tenant_id` | character varying | NO |
| `name` | character varying | NO |
| `description` | text | NO |
| `sort_order` | integer | NO |
| `active` | boolean | NO |
| `created_at` | timestamp with time zone | NO |
| `updated_at` | timestamp with time zone | NO |
| `created_by` | character varying | NO |
| `updated_by` | character varying | NO |
| `deleted_at` | timestamp with time zone | YES |
| `deleted_by` | character varying | YES |

## common/brand

Table: `brands`; collection: `/api/v1/brands`.

Editable: `name`, `logoUrl`, `logoAlt`, `showOnStorefront`, `sortOrder`, `active`.

Returned: `public_id`, `name`, `active`, `created_at`, `updated_at`, `created_by`, `updated_by`, `logoUrl`, `logoAlt`, `showOnStorefront`, `sortOrder`.

Codexsun `BrandsRecord`:

| Codexsun field | Native field | Exact name |
| --- | --- | --- |
| `id` |  | No |
| `isActive` |  | No |
| `logoAlt` | `logoAlt` | Yes |
| `logoUrl` | `logoUrl` | Yes |
| `name` | `name` | Yes |
| `showOnStorefront` | `showOnStorefront` | Yes |
| `sortOrder` | `sortOrder` | Yes |

| SQL column | PostgreSQL type | Nullable |
| --- | --- | --- |
| `id` | integer | NO |
| `public_id` | character varying | NO |
| `tenant_id` | character varying | NO |
| `name` | character varying | NO |
| `logo_url` | character varying | NO |
| `logo_alt` | character varying | NO |
| `show_on_storefront` | boolean | NO |
| `sort_order` | integer | NO |
| `active` | boolean | NO |
| `created_at` | timestamp with time zone | NO |
| `updated_at` | timestamp with time zone | NO |
| `created_by` | character varying | NO |
| `updated_by` | character varying | NO |
| `deleted_at` | timestamp with time zone | YES |
| `deleted_by` | character varying | YES |

## common/colour

Table: `colours`; collection: `/api/v1/colours`.

Editable: `name`, `sortOrder`, `active`.

Returned: `public_id`, `name`, `active`, `created_at`, `updated_at`, `created_by`, `updated_by`, `sortOrder`.

Codexsun `ColoursRecord`:

| Codexsun field | Native field | Exact name |
| --- | --- | --- |
| `id` |  | No |
| `name` | `name` | Yes |
| `isActive` |  | No |
| `sortOrder` | `sortOrder` | Yes |

| SQL column | PostgreSQL type | Nullable |
| --- | --- | --- |
| `id` | integer | NO |
| `public_id` | character varying | NO |
| `tenant_id` | character varying | NO |
| `name` | character varying | NO |
| `sort_order` | integer | NO |
| `active` | boolean | NO |
| `created_at` | timestamp with time zone | NO |
| `updated_at` | timestamp with time zone | NO |
| `created_by` | character varying | NO |
| `updated_by` | character varying | NO |
| `deleted_at` | timestamp with time zone | YES |
| `deleted_by` | character varying | YES |

## common/hsn-code

Table: `hsn_codes`; collection: `/api/v1/hsn-codes`.

Editable: `name`, `code`, `description`, `sortOrder`, `active`.

Returned: `public_id`, `name`, `active`, `created_at`, `updated_at`, `created_by`, `updated_by`, `code`, `description`, `sortOrder`.

Codexsun `HsnCodesRecord`:

| Codexsun field | Native field | Exact name |
| --- | --- | --- |
| `id` |  | No |
| `code` | `code` | Yes |
| `description` | `description` | Yes |
| `isActive` |  | No |
| `sortOrder` | `sortOrder` | Yes |

| SQL column | PostgreSQL type | Nullable |
| --- | --- | --- |
| `id` | integer | NO |
| `public_id` | character varying | NO |
| `tenant_id` | character varying | NO |
| `name` | character varying | NO |
| `code` | character varying | NO |
| `description` | text | NO |
| `sort_order` | integer | NO |
| `active` | boolean | NO |
| `created_at` | timestamp with time zone | NO |
| `updated_at` | timestamp with time zone | NO |
| `created_by` | character varying | NO |
| `updated_by` | character varying | NO |
| `deleted_at` | timestamp with time zone | YES |
| `deleted_by` | character varying | YES |

## common/product-category

Table: `product_categories`; collection: `/api/v1/product-categories`.

Editable: `name`, `sortOrder`, `active`.

Returned: `public_id`, `name`, `active`, `created_at`, `updated_at`, `created_by`, `updated_by`, `sortOrder`.

Codexsun `ProductCategoriesRecord`:

| Codexsun field | Native field | Exact name |
| --- | --- | --- |
| `id` |  | No |
| `name` | `name` | Yes |
| `isActive` |  | No |
| `sortOrder` | `sortOrder` | Yes |

| SQL column | PostgreSQL type | Nullable |
| --- | --- | --- |
| `id` | integer | NO |
| `public_id` | character varying | NO |
| `tenant_id` | character varying | NO |
| `name` | character varying | NO |
| `sort_order` | integer | NO |
| `active` | boolean | NO |
| `created_at` | timestamp with time zone | NO |
| `updated_at` | timestamp with time zone | NO |
| `created_by` | character varying | NO |
| `updated_by` | character varying | NO |
| `deleted_at` | timestamp with time zone | YES |
| `deleted_by` | character varying | YES |

## common/product-group

Table: `product_groups`; collection: `/api/v1/product-groups`.

Editable: `name`, `sortOrder`, `active`.

Returned: `public_id`, `name`, `active`, `created_at`, `updated_at`, `created_by`, `updated_by`, `sortOrder`.

Codexsun `ProductGroupsRecord`:

| Codexsun field | Native field | Exact name |
| --- | --- | --- |
| `id` |  | No |
| `name` | `name` | Yes |
| `isActive` |  | No |
| `sortOrder` | `sortOrder` | Yes |

| SQL column | PostgreSQL type | Nullable |
| --- | --- | --- |
| `id` | integer | NO |
| `public_id` | character varying | NO |
| `tenant_id` | character varying | NO |
| `name` | character varying | NO |
| `sort_order` | integer | NO |
| `active` | boolean | NO |
| `created_at` | timestamp with time zone | NO |
| `updated_at` | timestamp with time zone | NO |
| `created_by` | character varying | NO |
| `updated_by` | character varying | NO |
| `deleted_at` | timestamp with time zone | YES |
| `deleted_by` | character varying | YES |

## common/product-type

Table: `product_types`; collection: `/api/v1/product-types`.

Editable: `name`, `sortOrder`, `active`.

Returned: `public_id`, `name`, `active`, `created_at`, `updated_at`, `created_by`, `updated_by`, `sortOrder`.

Codexsun `ProductTypesRecord`:

| Codexsun field | Native field | Exact name |
| --- | --- | --- |
| `id` |  | No |
| `name` | `name` | Yes |
| `isActive` |  | No |
| `sortOrder` | `sortOrder` | Yes |

| SQL column | PostgreSQL type | Nullable |
| --- | --- | --- |
| `id` | integer | NO |
| `public_id` | character varying | NO |
| `tenant_id` | character varying | NO |
| `name` | character varying | NO |
| `sort_order` | integer | NO |
| `active` | boolean | NO |
| `created_at` | timestamp with time zone | NO |
| `updated_at` | timestamp with time zone | NO |
| `created_by` | character varying | NO |
| `updated_by` | character varying | NO |
| `deleted_at` | timestamp with time zone | YES |
| `deleted_by` | character varying | YES |

## common/size

Table: `sizes`; collection: `/api/v1/sizes`.

Editable: `name`, `sortOrder`, `active`.

Returned: `public_id`, `name`, `active`, `created_at`, `updated_at`, `created_by`, `updated_by`, `sortOrder`.

Codexsun `SizesRecord`:

| Codexsun field | Native field | Exact name |
| --- | --- | --- |
| `id` |  | No |
| `name` | `name` | Yes |
| `isActive` |  | No |
| `sortOrder` | `sortOrder` | Yes |

| SQL column | PostgreSQL type | Nullable |
| --- | --- | --- |
| `id` | integer | NO |
| `public_id` | character varying | NO |
| `tenant_id` | character varying | NO |
| `name` | character varying | NO |
| `sort_order` | integer | NO |
| `active` | boolean | NO |
| `created_at` | timestamp with time zone | NO |
| `updated_at` | timestamp with time zone | NO |
| `created_by` | character varying | NO |
| `updated_by` | character varying | NO |
| `deleted_at` | timestamp with time zone | YES |
| `deleted_by` | character varying | YES |

## common/style

Table: `styles`; collection: `/api/v1/styles`.

Editable: `name`, `sortOrder`, `active`.

Returned: `public_id`, `name`, `active`, `created_at`, `updated_at`, `created_by`, `updated_by`, `sortOrder`.

Codexsun `StylesRecord`:

| Codexsun field | Native field | Exact name |
| --- | --- | --- |
| `id` |  | No |
| `name` | `name` | Yes |
| `isActive` |  | No |
| `sortOrder` | `sortOrder` | Yes |

| SQL column | PostgreSQL type | Nullable |
| --- | --- | --- |
| `id` | integer | NO |
| `public_id` | character varying | NO |
| `tenant_id` | character varying | NO |
| `name` | character varying | NO |
| `sort_order` | integer | NO |
| `active` | boolean | NO |
| `created_at` | timestamp with time zone | NO |
| `updated_at` | timestamp with time zone | NO |
| `created_by` | character varying | NO |
| `updated_by` | character varying | NO |
| `deleted_at` | timestamp with time zone | YES |
| `deleted_by` | character varying | YES |

## common/tax

Table: `taxes`; collection: `/api/v1/taxes`.

Editable: `name`, `ratePercent`, `description`, `sortOrder`, `active`.

Returned: `public_id`, `name`, `active`, `created_at`, `updated_at`, `created_by`, `updated_by`, `ratePercent`, `description`, `sortOrder`.

Codexsun `TaxesRecord`:

| Codexsun field | Native field | Exact name |
| --- | --- | --- |
| `id` |  | No |
| `ratePercent` | `ratePercent` | Yes |
| `description` | `description` | Yes |
| `isActive` |  | No |
| `sortOrder` | `sortOrder` | Yes |

| SQL column | PostgreSQL type | Nullable |
| --- | --- | --- |
| `id` | integer | NO |
| `public_id` | character varying | NO |
| `tenant_id` | character varying | NO |
| `name` | character varying | NO |
| `rate_percent` | numeric | NO |
| `description` | text | NO |
| `sort_order` | integer | NO |
| `active` | boolean | NO |
| `created_at` | timestamp with time zone | NO |
| `updated_at` | timestamp with time zone | NO |
| `created_by` | character varying | NO |
| `updated_by` | character varying | NO |
| `deleted_at` | timestamp with time zone | YES |
| `deleted_by` | character varying | YES |

## common/unit

Table: `units`; collection: `/api/v1/units`.

Editable: `name`, `sortOrder`, `active`.

Returned: `public_id`, `name`, `active`, `created_at`, `updated_at`, `created_by`, `updated_by`, `sortOrder`.

Codexsun `UnitsRecord`:

| Codexsun field | Native field | Exact name |
| --- | --- | --- |
| `id` |  | No |
| `name` | `name` | Yes |
| `isActive` |  | No |
| `sortOrder` | `sortOrder` | Yes |

| SQL column | PostgreSQL type | Nullable |
| --- | --- | --- |
| `id` | integer | NO |
| `public_id` | character varying | NO |
| `tenant_id` | character varying | NO |
| `name` | character varying | NO |
| `sort_order` | integer | NO |
| `active` | boolean | NO |
| `created_at` | timestamp with time zone | NO |
| `updated_at` | timestamp with time zone | NO |
| `created_by` | character varying | NO |
| `updated_by` | character varying | NO |
| `deleted_at` | timestamp with time zone | YES |
| `deleted_by` | character varying | YES |

## common/destination

Table: `destinations`; collection: `/api/v1/destinations`.

Editable: `name`, `sortOrder`, `active`.

Returned: `public_id`, `name`, `active`, `created_at`, `updated_at`, `created_by`, `updated_by`, `sortOrder`.

Codexsun `DestinationsRecord`:

| Codexsun field | Native field | Exact name |
| --- | --- | --- |
| `id` |  | No |
| `name` | `name` | Yes |
| `isActive` |  | No |
| `sortOrder` | `sortOrder` | Yes |

| SQL column | PostgreSQL type | Nullable |
| --- | --- | --- |
| `id` | integer | NO |
| `public_id` | character varying | NO |
| `tenant_id` | character varying | NO |
| `name` | character varying | NO |
| `sort_order` | integer | NO |
| `active` | boolean | NO |
| `created_at` | timestamp with time zone | NO |
| `updated_at` | timestamp with time zone | NO |
| `created_by` | character varying | NO |
| `updated_by` | character varying | NO |
| `deleted_at` | timestamp with time zone | YES |
| `deleted_by` | character varying | YES |

## common/stock-rejection-type

Table: `stock_rejection_types`; collection: `/api/v1/stock-rejection-types`.

Editable: `name`, `sortOrder`, `active`.

Returned: `public_id`, `name`, `active`, `created_at`, `updated_at`, `created_by`, `updated_by`, `sortOrder`.

Codexsun `StockRejectionTypesRecord`:

| Codexsun field | Native field | Exact name |
| --- | --- | --- |
| `id` |  | No |
| `name` | `name` | Yes |
| `isActive` |  | No |
| `sortOrder` | `sortOrder` | Yes |

| SQL column | PostgreSQL type | Nullable |
| --- | --- | --- |
| `id` | integer | NO |
| `public_id` | character varying | NO |
| `tenant_id` | character varying | NO |
| `name` | character varying | NO |
| `sort_order` | integer | NO |
| `active` | boolean | NO |
| `created_at` | timestamp with time zone | NO |
| `updated_at` | timestamp with time zone | NO |
| `created_by` | character varying | NO |
| `updated_by` | character varying | NO |
| `deleted_at` | timestamp with time zone | YES |
| `deleted_by` | character varying | YES |

## common/transport

Table: `transports`; collection: `/api/v1/transports`.

Editable: `name`, `gst`, `vehicleNo`, `address`, `contactNo`, `contactPerson`, `sortOrder`, `active`.

Returned: `public_id`, `name`, `active`, `created_at`, `updated_at`, `created_by`, `updated_by`, `gst`, `vehicleNo`, `address`, `contactNo`, `contactPerson`, `sortOrder`.

Codexsun `TransportsRecord`:

| Codexsun field | Native field | Exact name |
| --- | --- | --- |
| `id` |  | No |
| `name` | `name` | Yes |
| `gst` | `gst` | Yes |
| `vehicleNo` | `vehicleNo` | Yes |
| `address` | `address` | Yes |
| `contactNo` | `contactNo` | Yes |
| `contactPerson` | `contactPerson` | Yes |
| `isActive` |  | No |
| `sortOrder` | `sortOrder` | Yes |

| SQL column | PostgreSQL type | Nullable |
| --- | --- | --- |
| `id` | integer | NO |
| `public_id` | character varying | NO |
| `tenant_id` | character varying | NO |
| `name` | character varying | NO |
| `gst` | character varying | NO |
| `vehicle_no` | character varying | NO |
| `address` | character varying | NO |
| `contact_no` | character varying | NO |
| `contact_person` | character varying | NO |
| `sort_order` | integer | NO |
| `active` | boolean | NO |
| `created_at` | timestamp with time zone | NO |
| `updated_at` | timestamp with time zone | NO |
| `created_by` | character varying | NO |
| `updated_by` | character varying | NO |
| `deleted_at` | timestamp with time zone | YES |
| `deleted_by` | character varying | YES |

## common/warehouse

Table: `warehouses`; collection: `/api/v1/warehouses`.

Editable: `name`, `sortOrder`, `active`.

Returned: `public_id`, `name`, `active`, `created_at`, `updated_at`, `created_by`, `updated_by`, `sortOrder`.

Codexsun `WarehousesRecord`:

| Codexsun field | Native field | Exact name |
| --- | --- | --- |
| `id` |  | No |
| `name` | `name` | Yes |
| `isActive` |  | No |
| `sortOrder` | `sortOrder` | Yes |

| SQL column | PostgreSQL type | Nullable |
| --- | --- | --- |
| `id` | integer | NO |
| `public_id` | character varying | NO |
| `tenant_id` | character varying | NO |
| `name` | character varying | NO |
| `sort_order` | integer | NO |
| `active` | boolean | NO |
| `created_at` | timestamp with time zone | NO |
| `updated_at` | timestamp with time zone | NO |
| `created_by` | character varying | NO |
| `updated_by` | character varying | NO |
| `deleted_at` | timestamp with time zone | YES |
| `deleted_by` | character varying | YES |

## common/work-order-type

Table: `work_order_types`; collection: `/api/v1/work-order-types`.

Editable: `name`, `sortOrder`, `active`.

Returned: `public_id`, `name`, `active`, `created_at`, `updated_at`, `created_by`, `updated_by`, `sortOrder`.

Codexsun `WorkOrderTypesRecord`:

| Codexsun field | Native field | Exact name |
| --- | --- | --- |
| `id` |  | No |
| `name` | `name` | Yes |
| `isActive` |  | No |
| `sortOrder` | `sortOrder` | Yes |

| SQL column | PostgreSQL type | Nullable |
| --- | --- | --- |
| `id` | integer | NO |
| `public_id` | character varying | NO |
| `tenant_id` | character varying | NO |
| `name` | character varying | NO |
| `sort_order` | integer | NO |
| `active` | boolean | NO |
| `created_at` | timestamp with time zone | NO |
| `updated_at` | timestamp with time zone | NO |
| `created_by` | character varying | NO |
| `updated_by` | character varying | NO |
| `deleted_at` | timestamp with time zone | YES |
| `deleted_by` | character varying | YES |

## master/company

Table: `companies`; collection: `/api/v1/companies`.

Editable: `name`, `code`, `legalName`, `gstin`, `pan`, `website`, `description`, `msmeNo`, `msmeCategory`, `tanNo`, `tdsAvailable`, `tcsAvailable`, `logoUrl`, `logoDarkUrl`, `faviconUrl`, `industryName`, `emails`, `phones`, `addresses`, `bankAccounts`, `socialLinks`, `active`.

Returned: `public_id`, `name`, `active`, `created_at`, `updated_at`, `created_by`, `updated_by`, `code`, `legalName`, `gstin`, `pan`, `website`, `description`, `msmeNo`, `msmeCategory`, `tanNo`, `tdsAvailable`, `tcsAvailable`, `logoUrl`, `logoDarkUrl`, `faviconUrl`, `industryName`, `emails`, `phones`, `addresses`, `bankAccounts`, `socialLinks`.

Codexsun `CompanyRecord`:

| Codexsun field | Native field | Exact name |
| --- | --- | --- |
| `id` |  | No |
| `code` | `code` | Yes |
| `name` | `name` | Yes |
| `legalName` | `legalName` | Yes |
| `primaryPhone` |  | No |
| `primaryEmail` |  | No |
| `gstin` | `gstin` | Yes |
| `pan` | `pan` | Yes |
| `msmeNo` | `msmeNo` | Yes |
| `msmeCategory` | `msmeCategory` | Yes |
| `tanNo` | `tanNo` | Yes |
| `tdsAvailable` | `tdsAvailable` | Yes |
| `tcsAvailable` | `tcsAvailable` | Yes |
| `website` | `website` | Yes |
| `description` | `description` | Yes |
| `logoPath` |  | No |
| `logoDarkPath` |  | No |
| `faviconPath` |  | No |
| `industryId` |  | No |
| `industryName` | `industryName` | Yes |
| `status` |  | No |
| `isActive` |  | No |
| `emails` | `emails` | Yes |
| `phones` | `phones` | Yes |
| `addresses` | `addresses` | Yes |
| `bankAccounts` | `bankAccounts` | Yes |
| `socialLinks` | `socialLinks` | Yes |
| `createdAt` |  | No |
| `updatedAt` |  | No |

| SQL column | PostgreSQL type | Nullable |
| --- | --- | --- |
| `id` | integer | NO |
| `public_id` | character varying | NO |
| `tenant_id` | character varying | NO |
| `name` | character varying | NO |
| `code` | character varying | NO |
| `legal_name` | character varying | NO |
| `gstin` | character varying | NO |
| `pan` | character varying | NO |
| `website` | character varying | NO |
| `description` | text | NO |
| `emails` | jsonb | NO |
| `phones` | jsonb | NO |
| `addresses` | jsonb | NO |
| `active` | boolean | NO |
| `created_at` | timestamp with time zone | NO |
| `updated_at` | timestamp with time zone | NO |
| `created_by` | character varying | NO |
| `updated_by` | character varying | NO |
| `deleted_at` | timestamp with time zone | YES |
| `deleted_by` | character varying | YES |
| `msme_no` | character varying | NO |
| `msme_category` | character varying | NO |
| `tan_no` | character varying | NO |
| `tds_available` | boolean | NO |
| `tcs_available` | boolean | NO |
| `logo_url` | character varying | NO |
| `logo_dark_url` | character varying | NO |
| `favicon_url` | character varying | NO |
| `industry_name` | character varying | NO |
| `bank_accounts` | jsonb | NO |
| `social_links` | jsonb | NO |

## master/financial-year

Table: `financial_years`; collection: `/api/v1/financial-years`.

Editable: `name`, `startDate`, `endDate`, `isCurrent`, `active`.

Returned: `public_id`, `name`, `active`, `created_at`, `updated_at`, `created_by`, `updated_by`, `startDate`, `endDate`, `isCurrent`.

Codexsun `FinancialYearRecord`:

| Codexsun field | Native field | Exact name |
| --- | --- | --- |
| `id` |  | No |
| `uuid` |  | No |
| `name` | `name` | Yes |
| `startDate` | `startDate` | Yes |
| `endDate` | `endDate` | Yes |
| `isCurrent` | `isCurrent` | Yes |
| `status` |  | No |
| `createdAt` |  | No |
| `updatedAt` |  | No |

| SQL column | PostgreSQL type | Nullable |
| --- | --- | --- |
| `id` | integer | NO |
| `public_id` | character varying | NO |
| `tenant_id` | character varying | NO |
| `name` | character varying | NO |
| `start_date` | date | NO |
| `end_date` | date | NO |
| `is_current` | boolean | NO |
| `active` | boolean | NO |
| `created_at` | timestamp with time zone | NO |
| `updated_at` | timestamp with time zone | NO |
| `created_by` | character varying | NO |
| `updated_by` | character varying | NO |
| `deleted_at` | timestamp with time zone | YES |
| `deleted_by` | character varying | YES |

## master/contact

Table: `contacts`; collection: `/api/v1/contacts`.

Editable: `name`, `code`, `legalName`, `role`, `typeId`, `groupId`, `gstin`, `pan`, `website`, `description`, `msmeNo`, `msmeCategory`, `tanNo`, `tdsAvailable`, `tcsAvailable`, `creditLimit`, `emails`, `phones`, `addresses`, `bankAccounts`, `socialLinks`, `active`.

Returned: `public_id`, `name`, `active`, `created_at`, `updated_at`, `created_by`, `updated_by`, `code`, `legalName`, `role`, `gstin`, `pan`, `website`, `description`, `msmeNo`, `msmeCategory`, `tanNo`, `tdsAvailable`, `tcsAvailable`, `creditLimit`, `emails`, `phones`, `addresses`, `bankAccounts`, `socialLinks`, `typeId`, `typeName`, `groupId`, `groupName`.

Codexsun `ContactRecord`:

| Codexsun field | Native field | Exact name |
| --- | --- | --- |
| `id` |  | No |
| `uuid` |  | No |
| `code` | `code` | Yes |
| `name` | `name` | Yes |
| `legalName` | `legalName` | Yes |
| `typeId` | `typeId` | Yes |
| `typeName` | `typeName` | Yes |
| `groupId` | `groupId` | Yes |
| `groupName` | `groupName` | Yes |
| `primaryPhone` |  | No |
| `primaryEmail` |  | No |
| `gstin` | `gstin` | Yes |
| `pan` | `pan` | Yes |
| `msmeNo` | `msmeNo` | Yes |
| `msmeCategory` | `msmeCategory` | Yes |
| `tanNo` | `tanNo` | Yes |
| `tdsAvailable` | `tdsAvailable` | Yes |
| `tcsAvailable` | `tcsAvailable` | Yes |
| `openingBalance` |  | No |
| `creditLimit` | `creditLimit` | Yes |
| `website` | `website` | Yes |
| `description` | `description` | Yes |
| `status` |  | No |
| `isActive` |  | No |
| `emails` | `emails` | Yes |
| `phones` | `phones` | Yes |
| `addresses` | `addresses` | Yes |
| `bankAccounts` | `bankAccounts` | Yes |
| `socialLinks` | `socialLinks` | Yes |
| `createdAt` |  | No |
| `updatedAt` |  | No |
| `deletedAt` |  | No |

| SQL column | PostgreSQL type | Nullable |
| --- | --- | --- |
| `id` | integer | NO |
| `public_id` | character varying | NO |
| `tenant_id` | character varying | NO |
| `name` | character varying | NO |
| `code` | character varying | NO |
| `legal_name` | character varying | NO |
| `role` | character varying | NO |
| `gstin` | character varying | NO |
| `pan` | character varying | NO |
| `website` | character varying | NO |
| `description` | text | NO |
| `emails` | jsonb | NO |
| `phones` | jsonb | NO |
| `addresses` | jsonb | NO |
| `active` | boolean | NO |
| `created_at` | timestamp with time zone | NO |
| `updated_at` | timestamp with time zone | NO |
| `created_by` | character varying | NO |
| `updated_by` | character varying | NO |
| `deleted_at` | timestamp with time zone | YES |
| `deleted_by` | character varying | YES |
| `type_id` | integer | YES |
| `group_id` | integer | YES |
| `msme_no` | character varying | NO |
| `msme_category` | character varying | NO |
| `tan_no` | character varying | NO |
| `tds_available` | boolean | NO |
| `tcs_available` | boolean | NO |
| `credit_limit` | numeric | NO |
| `bank_accounts` | jsonb | NO |
| `social_links` | jsonb | NO |

## master/product

Table: `products`; collection: `/api/v1/products`.

Editable: `name`, `typeId`, `productCategoryId`, `productGroupId`, `hsnCodeId`, `unitId`, `taxId`, `brandId`, `openingStock`, `openingRate`, `description`, `active`.

Returned: `public_id`, `name`, `active`, `created_at`, `updated_at`, `created_by`, `updated_by`, `openingStock`, `openingRate`, `description`, `typeId`, `typeName`, `productCategoryId`, `productCategoryName`, `productGroupId`, `productGroupName`, `hsnCodeId`, `hsnCodeName`, `unitId`, `unitName`, `taxId`, `taxName`, `taxRate`, `hsnCode`, `brandId`, `brandName`.

Codexsun `ProductRecord`:

| Codexsun field | Native field | Exact name |
| --- | --- | --- |
| `id` |  | No |
| `uuid` |  | No |
| `name` | `name` | Yes |
| `typeId` | `typeId` | Yes |
| `productCategoryId` | `productCategoryId` | Yes |
| `hsnCodeId` | `hsnCodeId` | Yes |
| `unitId` | `unitId` | Yes |
| `taxId` | `taxId` | Yes |
| `typeName` | `typeName` | Yes |
| `productCategoryName` | `productCategoryName` | Yes |
| `hsnCode` | `hsnCode` | Yes |
| `unitName` | `unitName` | Yes |
| `taxName` | `taxName` | Yes |
| `taxRate` | `taxRate` | Yes |
| `openingStock` | `openingStock` | Yes |
| `openingRate` | `openingRate` | Yes |
| `status` |  | No |
| `isActive` |  | No |
| `createdAt` |  | No |
| `updatedAt` |  | No |
| `deletedAt` |  | No |

| SQL column | PostgreSQL type | Nullable |
| --- | --- | --- |
| `id` | integer | NO |
| `public_id` | character varying | NO |
| `tenant_id` | character varying | NO |
| `name` | character varying | NO |
| `type_id` | integer | YES |
| `product_category_id` | integer | YES |
| `product_group_id` | integer | YES |
| `hsn_code_id` | integer | YES |
| `unit_id` | integer | YES |
| `tax_id` | integer | YES |
| `brand_id` | integer | YES |
| `opening_stock` | numeric | NO |
| `opening_rate` | numeric | NO |
| `description` | text | NO |
| `active` | boolean | NO |
| `created_at` | timestamp with time zone | NO |
| `updated_at` | timestamp with time zone | NO |
| `created_by` | character varying | NO |
| `updated_by` | character varying | NO |
| `deleted_at` | timestamp with time zone | YES |
| `deleted_by` | character varying | YES |

## master/work-order

Table: `work_orders`; collection: `/api/v1/work-orders`.

Editable: `name`, `code`, `active`.

Returned: `public_id`, `name`, `active`, `created_at`, `updated_at`, `created_by`, `updated_by`, `code`.

Codexsun `WorkOrderRecord`:

| Codexsun field | Native field | Exact name |
| --- | --- | --- |
| `id` |  | No |
| `uuid` |  | No |
| `code` | `code` | Yes |
| `name` | `name` | Yes |
| `status` |  | No |
| `isActive` |  | No |
| `createdAt` |  | No |
| `updatedAt` |  | No |
| `deletedAt` |  | No |

| SQL column | PostgreSQL type | Nullable |
| --- | --- | --- |
| `id` | integer | NO |
| `public_id` | character varying | NO |
| `tenant_id` | character varying | NO |
| `name` | character varying | NO |
| `code` | character varying | NO |
| `active` | boolean | NO |
| `created_at` | timestamp with time zone | NO |
| `updated_at` | timestamp with time zone | NO |
| `created_by` | character varying | NO |
| `updated_by` | character varying | NO |
| `deleted_at` | timestamp with time zone | YES |
| `deleted_by` | character varying | YES |

## master/default-company

Table: `default_companies`; collection: `/api/v1/default-companies`.

Editable: `name`, `companyId`, `financialYearId`, `landingApp`, `active`.

Returned: `public_id`, `name`, `active`, `created_at`, `updated_at`, `created_by`, `updated_by`, `landingApp`, `companyId`, `companyName`, `financialYearId`, `financialYearName`.

Codexsun `DefaultCompanyRecord`:

| Codexsun field | Native field | Exact name |
| --- | --- | --- |
| `id` |  | No |
| `companyId` | `companyId` | Yes |
| `companyCode` |  | No |
| `companyName` | `companyName` | Yes |
| `financialYearId` | `financialYearId` | Yes |
| `financialYearName` | `financialYearName` | Yes |
| `financialYearStartDate` |  | No |
| `financialYearEndDate` |  | No |
| `landingApp` | `landingApp` | Yes |
| `status` |  | No |
| `createdAt` |  | No |
| `updatedAt` |  | No |

| SQL column | PostgreSQL type | Nullable |
| --- | --- | --- |
| `id` | integer | NO |
| `public_id` | character varying | NO |
| `tenant_id` | character varying | NO |
| `name` | character varying | NO |
| `company_id` | integer | YES |
| `financial_year_id` | integer | YES |
| `landing_app` | character varying | NO |
| `active` | boolean | NO |
| `created_at` | timestamp with time zone | NO |
| `updated_at` | timestamp with time zone | NO |
| `created_by` | character varying | NO |
| `updated_by` | character varying | NO |
| `deleted_at` | timestamp with time zone | YES |
| `deleted_by` | character varying | YES |

## Exact legacy child, save and other object fields

Source evidence; these lists do not claim every legacy field is accepted by the native API.

### country

- `Country`: `id`, `code`, `name`, `sortOrder`, `status`
- `CountrySavePayload`: `code`, `name`, `sortOrder`, `status`

### state

- `State`: `id`, `countryId`, `countryName`, `code`, `name`, `sortOrder`, `status`
- `StateSavePayload`: `countryId`, `code`, `name`, `sortOrder`, `status`

### district

- `District`: `id`, `stateId`, `stateName`, `countryId`, `countryName`, `name`, `sortOrder`, `status`
- `DistrictSavePayload`: `stateId`, `name`, `sortOrder`, `status`

### city

- `City`: `id`, `districtId`, `districtName`, `stateId`, `stateName`, `countryId`, `countryName`, `name`, `sortOrder`, `status`
- `CitySavePayload`: `districtId`, `name`, `sortOrder`, `status`

### pincode

- `Pincode`: `id`, `cityId`, `name`, `area`, `sortOrder`, `status`
- `PincodeSavePayload`: `cityId`, `name`, `area`, `sortOrder`, `status`

### ledger-group


### ledger

- `LedgerRecord`: `id`, `ledgerGroupId`, `ledgerGroupName`, `name`, `status`

### address-type

- `AddressTypesRecord`: `id`, `name`, `isActive`, `sortOrder`
- `AddressTypesSavePayload`: `name`, `isActive`, `sortOrder`

### bank-name

- `BankNamesRecord`: `id`, `name`, `isActive`, `sortOrder`
- `BankNamesSavePayload`: `name`, `isActive`, `sortOrder`

### contact-group

- `ContactGroupsRecord`: `id`, `name`, `isActive`, `sortOrder`
- `ContactGroupsSavePayload`: `name`, `isActive`, `sortOrder`

### contact-type

- `ContactTypesRecord`: `id`, `name`, `isActive`, `sortOrder`
- `ContactTypesSavePayload`: `name`, `isActive`, `sortOrder`

### currency

- `CurrenciesRecord`: `id`, `name`, `symbol`, `isActive`, `sortOrder`
- `CurrenciesSavePayload`: `name`, `symbol`, `isActive`, `sortOrder`

### month

- `MonthsRecord`: `id`, `name`, `startDate`, `endDate`, `isActive`, `sortOrder`
- `MonthsSavePayload`: `name`, `startDate`, `endDate`, `isActive`, `sortOrder`

### payment-term

- `PaymentTermsRecord`: `id`, `name`, `isActive`, `sortOrder`
- `PaymentTermsSavePayload`: `name`, `isActive`, `sortOrder`

### priority

- `PrioritiesRecord`: `id`, `name`, `colour`, `tag`, `isActive`, `sortOrder`
- `PrioritiesSavePayload`: `name`, `colour`, `tag`, `isActive`, `sortOrder`

### sales-type

- `SalesTypesRecord`: `id`, `name`, `description`, `isActive`, `sortOrder`
- `SalesTypesSavePayload`: `name`, `description`, `isActive`, `sortOrder`

### brand

- `BrandsRecord`: `id`, `isActive`, `logoAlt`, `logoUrl`, `name`, `showOnStorefront`, `sortOrder`
- `BrandsSavePayload`: `name`, `isActive`, `logoAlt`, `logoUrl`, `showOnStorefront`, `sortOrder`

### colour

- `ColoursRecord`: `id`, `name`, `isActive`, `sortOrder`
- `ColoursSavePayload`: `name`, `isActive`, `sortOrder`

### hsn-code

- `HsnCodesRecord`: `id`, `code`, `description`, `isActive`, `sortOrder`
- `HsnCodesSavePayload`: `code`, `description`, `isActive`, `sortOrder`

### product-category

- `ProductCategoriesRecord`: `id`, `name`, `isActive`, `sortOrder`
- `ProductCategoriesSavePayload`: `name`, `isActive`, `sortOrder`

### product-group

- `ProductGroupsRecord`: `id`, `name`, `isActive`, `sortOrder`
- `ProductGroupsSavePayload`: `name`, `isActive`, `sortOrder`

### product-type

- `ProductTypesRecord`: `id`, `name`, `isActive`, `sortOrder`
- `ProductTypesSavePayload`: `name`, `isActive`, `sortOrder`

### size

- `SizesRecord`: `id`, `name`, `isActive`, `sortOrder`
- `SizesSavePayload`: `name`, `isActive`, `sortOrder`

### style

- `StylesRecord`: `id`, `name`, `isActive`, `sortOrder`
- `StylesSavePayload`: `name`, `isActive`, `sortOrder`

### tax

- `TaxesRecord`: `id`, `ratePercent`, `description`, `isActive`, `sortOrder`
- `TaxesSavePayload`: `ratePercent`, `description`, `isActive`, `sortOrder`

### unit

- `UnitsRecord`: `id`, `name`, `isActive`, `sortOrder`
- `UnitsSavePayload`: `name`, `isActive`, `sortOrder`

### destination

- `DestinationsRecord`: `id`, `name`, `isActive`, `sortOrder`
- `DestinationsSavePayload`: `name`, `isActive`, `sortOrder`

### stock-rejection-type

- `StockRejectionTypesRecord`: `id`, `name`, `isActive`, `sortOrder`
- `StockRejectionTypesSavePayload`: `name`, `isActive`, `sortOrder`

### transport

- `TransportsRecord`: `id`, `name`, `gst`, `vehicleNo`, `address`, `contactNo`, `contactPerson`, `isActive`, `sortOrder`
- `TransportsSavePayload`: `name`, `gst`, `vehicleNo`, `address`, `contactNo`, `contactPerson`, `isActive`, `sortOrder`

### warehouse

- `WarehousesRecord`: `id`, `name`, `isActive`, `sortOrder`
- `WarehousesSavePayload`: `name`, `isActive`, `sortOrder`

### work-order-type

- `WorkOrderTypesRecord`: `id`, `name`, `isActive`, `sortOrder`
- `WorkOrderTypesSavePayload`: `name`, `isActive`, `sortOrder`

### company

- `CompanyEmail`: `id`, `email`, `emailType`, `isPrimary`, `sortOrder`
- `CompanyPhone`: `id`, `phone`, `phoneType`, `isPrimary`, `sortOrder`
- `CompanyAddress`: `id`, `addressTypeId`, `addressTypeName`, `addressLine1`, `addressLine2`, `countryId`, `countryName`, `stateId`, `stateName`, `districtId`, `districtName`, `cityId`, `cityName`, `pincodeId`, `pincodeName`, `isDefault`, `sortOrder`
- `CompanyBankAccount`: `id`, `bankNameId`, `bankName`, `accountType`, `accountNumber`, `holderName`, `ifsc`, `branch`, `isPrimary`, `sortOrder`
- `CompanySocialLink`: `id`, `platform`, `url`, `status`, `isActive`, `sortOrder`
- `CompanyRecord`: `id`, `code`, `name`, `legalName`, `primaryPhone`, `primaryEmail`, `gstin`, `pan`, `msmeNo`, `msmeCategory`, `tanNo`, `tdsAvailable`, `tcsAvailable`, `website`, `description`, `logoPath`, `logoDarkPath`, `faviconPath`, `industryId`, `industryName`, `status`, `isActive`, `emails`, `phones`, `addresses`, `bankAccounts`, `socialLinks`, `createdAt`, `updatedAt`
- `CompanySaveInput`: `code`, `name`, `legalName`, `gstin`, `pan`, `msmeNo`, `msmeCategory`, `tanNo`, `tdsAvailable`, `tcsAvailable`, `website`, `description`, `logoPath`, `logoDarkPath`, `faviconPath`, `industryId`, `industryName`, `status`, `isActive`, `emails`, `phones`, `addresses`, `bankAccounts`, `socialLinks`

### financial-year

- `FinancialYearRecord`: `id`, `uuid`, `name`, `startDate`, `endDate`, `isCurrent`, `status`, `createdAt`, `updatedAt`
- `FinancialYearSavePayload`: `name`, `startDate`, `endDate`, `isCurrent`, `status`

### contact

- `ContactEmail`: `id`, `email`, `emailType`, `isPrimary`, `sortOrder`
- `ContactPhone`: `id`, `phone`, `phoneType`, `isPrimary`, `sortOrder`
- `ContactAddress`: `id`, `addressTypeId`, `addressTypeName`, `addressLine1`, `addressLine2`, `countryId`, `countryName`, `stateId`, `stateName`, `districtId`, `districtName`, `cityId`, `cityName`, `pincodeId`, `pincodeName`, `isDefault`, `sortOrder`
- `ContactBankAccount`: `id`, `bankNameId`, `bankName`, `accountType`, `accountNumber`, `holderName`, `ifsc`, `branch`, `isPrimary`, `sortOrder`
- `ContactSocialLink`: `id`, `platform`, `url`, `status`, `isActive`, `sortOrder`
- `ContactRecord`: `id`, `uuid`, `code`, `name`, `legalName`, `typeId`, `typeName`, `groupId`, `groupName`, `primaryPhone`, `primaryEmail`, `gstin`, `pan`, `msmeNo`, `msmeCategory`, `tanNo`, `tdsAvailable`, `tcsAvailable`, `openingBalance`, `creditLimit`, `website`, `description`, `status`, `isActive`, `emails`, `phones`, `addresses`, `bankAccounts`, `socialLinks`, `createdAt`, `updatedAt`, `deletedAt`
- `ContactSaveInput`: `code`, `name`, `legalName`, `typeId`, `typeName`, `groupId`, `groupName`, `gstin`, `pan`, `msmeNo`, `msmeCategory`, `tanNo`, `tdsAvailable`, `tcsAvailable`, `openingBalance`, `creditLimit`, `website`, `description`, `status`, `isActive`, `emails`, `phones`, `addresses`, `bankAccounts`, `socialLinks`
- `ContactAddressUpdateInput`: derived source type; no directly declared fields captured.

### product

- `ProductRecord`: `id`, `uuid`, `name`, `typeId`, `productCategoryId`, `hsnCodeId`, `unitId`, `taxId`, `typeName`, `productCategoryName`, `hsnCode`, `unitName`, `taxName`, `taxRate`, `openingStock`, `openingRate`, `status`, `isActive`, `createdAt`, `updatedAt`, `deletedAt`

### work-order

- `WorkOrderRecord`: `id`, `uuid`, `code`, `name`, `status`, `isActive`, `createdAt`, `updatedAt`, `deletedAt`

### default-company

- `DefaultCompanyRecord`: `id`, `companyId`, `companyCode`, `companyName`, `financialYearId`, `financialYearName`, `financialYearStartDate`, `financialYearEndDate`, `landingApp`, `status`, `createdAt`, `updatedAt`
- `DefaultCompanySavePayload`: `companyId`, `financialYearId`, `landingApp`, `status`
- `ApplicationCompanyBranding`: `brandName`, `companyId`, `legalName`, `logoDarkPath`, `logoPath`, `faviconPath`, `name`, `updatedAt`
