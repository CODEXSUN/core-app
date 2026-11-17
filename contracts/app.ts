export const appDetails = {
  name: "core-app",
  purpose:
    "Shared company, financial year and contact master data for business apps",
  prefix: "CORE_APP",
  port: 4345,
  cityEnabled: false,
  moduleRoutes: [
    {
      key: "common/country",
      label: "Countries",
      path: "/countries",
    },
    {
      key: "common/state",
      label: "States",
      path: "/states",
    },
    {
      key: "common/district",
      label: "Districts",
      path: "/districts",
    },
    {
      key: "common/city",
      label: "Cities",
      path: "/cities",
    },
    {
      key: "common/pincode",
      label: "Pincodes",
      path: "/pincodes",
    },
    {
      key: "common/ledger-group",
      label: "Ledger Groups",
      path: "/ledger-groups",
    },
    {
      key: "common/ledger",
      label: "Ledgers",
      path: "/ledgers",
    },
    {
      key: "common/address-type",
      label: "Address Types",
      path: "/address-types",
    },
    {
      key: "common/bank-name",
      label: "Bank Names",
      path: "/bank-names",
    },
    {
      key: "common/contact-group",
      label: "Contact Groups",
      path: "/contact-groups",
    },
    {
      key: "common/contact-type",
      label: "Contact Types",
      path: "/contact-types",
    },
    {
      key: "common/currency",
      label: "Currencies",
      path: "/currencies",
    },
    {
      key: "common/month",
      label: "Months",
      path: "/months",
    },
    {
      key: "common/payment-term",
      label: "Payment Terms",
      path: "/payment-terms",
    },
    {
      key: "common/priority",
      label: "Priorities",
      path: "/priorities",
    },
    {
      key: "common/sales-type",
      label: "Sales Types",
      path: "/sales-types",
    },
    {
      key: "common/brand",
      label: "Brands",
      path: "/brands",
    },
    {
      key: "common/colour",
      label: "Colours",
      path: "/colours",
    },
    {
      key: "common/hsn-code",
      label: "Hsn Codes",
      path: "/hsn-codes",
    },
    {
      key: "common/product-category",
      label: "Product Categories",
      path: "/product-categories",
    },
    {
      key: "common/product-group",
      label: "Product Groups",
      path: "/product-groups",
    },
    {
      key: "common/product-type",
      label: "Product Types",
      path: "/product-types",
    },
    {
      key: "common/size",
      label: "Sizes",
      path: "/sizes",
    },
    {
      key: "common/style",
      label: "Styles",
      path: "/styles",
    },
    {
      key: "common/tax",
      label: "Taxes",
      path: "/taxes",
    },
    {
      key: "common/unit",
      label: "Units",
      path: "/units",
    },
    {
      key: "common/destination",
      label: "Destinations",
      path: "/destinations",
    },
    {
      key: "common/stock-rejection-type",
      label: "Stock Rejection Types",
      path: "/stock-rejection-types",
    },
    {
      key: "common/transport",
      label: "Transports",
      path: "/transports",
    },
    {
      key: "common/warehouse",
      label: "Warehouses",
      path: "/warehouses",
    },
    {
      key: "common/work-order-type",
      label: "Work Order Types",
      path: "/work-order-types",
    },
    {
      key: "master/company",
      label: "Companies",
      path: "/companies",
    },
    {
      key: "master/financial-year",
      label: "Financial Years",
      path: "/financial-years",
    },
    {
      key: "master/contact",
      label: "Contacts",
      path: "/contacts",
    },
    {
      key: "master/product",
      label: "Products",
      path: "/products",
    },
    {
      key: "master/work-order",
      label: "Work Orders",
      path: "/work-orders",
    },
    {
      key: "master/default-company",
      label: "Default Companies",
      path: "/default-companies",
    },
  ],
};
