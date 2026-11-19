import type { Country } from "./country.ts";
import type { State } from "./state.ts";
import type { District } from "./district.ts";
import type { City } from "./city.ts";
import type { Pincode } from "./pincode.ts";
import type { LedgerGroup } from "./ledger-group.ts";
import type { Ledger } from "./ledger.ts";
import type { AddressType } from "./address-type.ts";
import type { BankName } from "./bank-name.ts";
import type { ContactGroup } from "./contact-group.ts";
import type { ContactType } from "./contact-type.ts";
import type { Currency } from "./currency.ts";
import type { Month } from "./month.ts";
import type { PaymentTerm } from "./payment-term.ts";
import type { Priority } from "./priority.ts";
import type { SalesType } from "./sales-type.ts";
import type { Brand } from "./brand.ts";
import type { Colour } from "./colour.ts";
import type { HsnCode } from "./hsn-code.ts";
import type { ProductCategory } from "./product-category.ts";
import type { ProductGroup } from "./product-group.ts";
import type { ProductType } from "./product-type.ts";
import type { Size } from "./size.ts";
import type { Style } from "./style.ts";
import type { Tax } from "./tax.ts";
import type { Unit } from "./unit.ts";
import type { Destination } from "./destination.ts";
import type { StockRejectionType } from "./stock-rejection-type.ts";
import type { Transport } from "./transport.ts";
import type { Warehouse } from "./warehouse.ts";
import type { WorkOrderType } from "./work-order-type.ts";
import type { Company } from "./company.ts";
import type { FinancialYear } from "./financial-year.ts";
import type { Contact } from "./contact.ts";
import type { Product } from "./product.ts";
import type { WorkOrder } from "./work-order.ts";
import type { DefaultCompany } from "./default-company.ts";
import type { OrganisationContext } from "./organisation-context.ts";
import {billingContextSelectionSchema,type BillingContextSelection,type BillingCoreContext} from './billing-context.ts';
// Server-to-server client. Keep the token in Billing's private server environment.
// The API, not a tenant argument or request header, determines the authorized scope.
export function createCoreClient({
  baseUrl,
  token,
  fetcher,
}: {
  baseUrl: string;
  token?: string;
  fetcher?: typeof fetch;
}) {
  const base = new URL(baseUrl);
  if (
    base.username ||
    base.password ||
    base.search ||
    base.hash ||
    base.pathname !== "/"
  ) {
    throw new Error("Use the Core server origin as baseUrl.");
  }
  if ((token === undefined && !fetcher) || (token !== undefined && token.length < 32))
    throw new Error("Configure a Core API access key.");
  async function read<T>(collection: string, publicId?: string): Promise<T> {
    if (publicId !== undefined && !/^[a-z0-9]{8}$/.test(publicId))
      throw new Error("Invalid Core public ID.");
    const response = await (fetcher ?? fetch)(
      new URL("/api/v1/" + collection + (publicId ? "/" + publicId : ""), base),
      {
        headers: token ? { Authorization: "Bearer " + token } : {},
        signal: AbortSignal.timeout(5000),
        cache: "no-store",
      },
    );
    if (!response.ok)
      throw new Error(`Core request failed (${response.status}).`);
    return response.json();
  }
  return {
    getBillingContext:(selection:BillingContextSelection={})=>{
      const value=billingContextSelectionSchema.parse(selection),query=new URLSearchParams(value).toString();
      return read<BillingCoreContext>('billing-context'+(query?'?'+query:''));
    },
    listCountries: () => read<Country[]>("countries"),
    getCountry: (publicId: string) => read<Country>("countries", publicId),
    listStates: () => read<State[]>("states"),
    getState: (publicId: string) => read<State>("states", publicId),
    listDistricts: () => read<District[]>("districts"),
    getDistrict: (publicId: string) => read<District>("districts", publicId),
    listCities: () => read<City[]>("cities"),
    getCity: (publicId: string) => read<City>("cities", publicId),
    listPincodes: () => read<Pincode[]>("pincodes"),
    getPincode: (publicId: string) => read<Pincode>("pincodes", publicId),
    listLedgerGroups: () => read<LedgerGroup[]>("ledger-groups"),
    getLedgerGroup: (publicId: string) =>
      read<LedgerGroup>("ledger-groups", publicId),
    listLedgers: () => read<Ledger[]>("ledgers"),
    getLedger: (publicId: string) => read<Ledger>("ledgers", publicId),
    listAddressTypes: () => read<AddressType[]>("address-types"),
    getAddressType: (publicId: string) =>
      read<AddressType>("address-types", publicId),
    listBankNames: () => read<BankName[]>("bank-names"),
    getBankName: (publicId: string) => read<BankName>("bank-names", publicId),
    listContactGroups: () => read<ContactGroup[]>("contact-groups"),
    getContactGroup: (publicId: string) =>
      read<ContactGroup>("contact-groups", publicId),
    listContactTypes: () => read<ContactType[]>("contact-types"),
    getContactType: (publicId: string) =>
      read<ContactType>("contact-types", publicId),
    listCurrencies: () => read<Currency[]>("currencies"),
    getCurrency: (publicId: string) => read<Currency>("currencies", publicId),
    listMonths: () => read<Month[]>("months"),
    getMonth: (publicId: string) => read<Month>("months", publicId),
    listPaymentTerms: () => read<PaymentTerm[]>("payment-terms"),
    getPaymentTerm: (publicId: string) =>
      read<PaymentTerm>("payment-terms", publicId),
    listPriorities: () => read<Priority[]>("priorities"),
    getPriority: (publicId: string) => read<Priority>("priorities", publicId),
    listSalesTypes: () => read<SalesType[]>("sales-types"),
    getSalesType: (publicId: string) =>
      read<SalesType>("sales-types", publicId),
    listBrands: () => read<Brand[]>("brands"),
    getBrand: (publicId: string) => read<Brand>("brands", publicId),
    listColours: () => read<Colour[]>("colours"),
    getColour: (publicId: string) => read<Colour>("colours", publicId),
    listHsnCodes: () => read<HsnCode[]>("hsn-codes"),
    getHsnCode: (publicId: string) => read<HsnCode>("hsn-codes", publicId),
    listProductCategories: () => read<ProductCategory[]>("product-categories"),
    getProductCategory: (publicId: string) =>
      read<ProductCategory>("product-categories", publicId),
    listProductGroups: () => read<ProductGroup[]>("product-groups"),
    getProductGroup: (publicId: string) =>
      read<ProductGroup>("product-groups", publicId),
    listProductTypes: () => read<ProductType[]>("product-types"),
    getProductType: (publicId: string) =>
      read<ProductType>("product-types", publicId),
    listSizes: () => read<Size[]>("sizes"),
    getSize: (publicId: string) => read<Size>("sizes", publicId),
    listStyles: () => read<Style[]>("styles"),
    getStyle: (publicId: string) => read<Style>("styles", publicId),
    listTaxes: () => read<Tax[]>("taxes"),
    getTax: (publicId: string) => read<Tax>("taxes", publicId),
    listUnits: () => read<Unit[]>("units"),
    getUnit: (publicId: string) => read<Unit>("units", publicId),
    listDestinations: () => read<Destination[]>("destinations"),
    getDestination: (publicId: string) =>
      read<Destination>("destinations", publicId),
    listStockRejectionTypes: () =>
      read<StockRejectionType[]>("stock-rejection-types"),
    getStockRejectionType: (publicId: string) =>
      read<StockRejectionType>("stock-rejection-types", publicId),
    listTransports: () => read<Transport[]>("transports"),
    getTransport: (publicId: string) => read<Transport>("transports", publicId),
    listWarehouses: () => read<Warehouse[]>("warehouses"),
    getWarehouse: (publicId: string) => read<Warehouse>("warehouses", publicId),
    listWorkOrderTypes: () => read<WorkOrderType[]>("work-order-types"),
    getWorkOrderType: (publicId: string) =>
      read<WorkOrderType>("work-order-types", publicId),
    listCompanies: () => read<Company[]>("companies"),
    getCompany: (publicId: string) => read<Company>("companies", publicId),
    listFinancialYears: () => read<FinancialYear[]>("financial-years"),
    getFinancialYear: (publicId: string) =>
      read<FinancialYear>("financial-years", publicId),
    listContacts: () => read<Contact[]>("contacts"),
    getContact: (publicId: string) => read<Contact>("contacts", publicId),
    listProducts: () => read<Product[]>("products"),
    getProduct: (publicId: string) => read<Product>("products", publicId),
    listWorkOrders: () => read<WorkOrder[]>("work-orders"),
    getWorkOrder: (publicId: string) =>
      read<WorkOrder>("work-orders", publicId),
    listDefaultCompanies: () => read<DefaultCompany[]>("default-companies"),
    getDefaultCompany: (publicId: string) =>
      read<DefaultCompany>("default-companies", publicId),
    getOrganisationContext: () =>
      read<OrganisationContext>("organisation-context"),
    getCurrentDefaultCompany: () =>
      read<DefaultCompany>("default-companies/current"),
  };
}
