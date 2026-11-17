import { registerOrganisationContextRoutes } from "./master/default-company/routes.ts";
import type { FastifyInstance } from "fastify";
import type { Kysely } from "kysely";
import type { Database } from "../database/schema.ts";
import type { ContextResolver } from "../database/context.ts";
import { createCountryService } from "./common/country/service.ts";
import {
  registerCountryRoutes,
  countryOpenApiPaths,
} from "./common/country/routes.ts";
import { createStateService } from "./common/state/service.ts";
import {
  registerStateRoutes,
  stateOpenApiPaths,
} from "./common/state/routes.ts";
import { createDistrictService } from "./common/district/service.ts";
import {
  registerDistrictRoutes,
  districtOpenApiPaths,
} from "./common/district/routes.ts";
import { createCityService } from "./common/city/service.ts";
import { registerCityRoutes, cityOpenApiPaths } from "./common/city/routes.ts";
import { createPincodeService } from "./common/pincode/service.ts";
import {
  registerPincodeRoutes,
  pincodeOpenApiPaths,
} from "./common/pincode/routes.ts";
import { createLedgerGroupService } from "./common/ledger-group/service.ts";
import {
  registerLedgerGroupRoutes,
  ledgerGroupOpenApiPaths,
} from "./common/ledger-group/routes.ts";
import { createLedgerService } from "./common/ledger/service.ts";
import {
  registerLedgerRoutes,
  ledgerOpenApiPaths,
} from "./common/ledger/routes.ts";
import { createAddressTypeService } from "./common/address-type/service.ts";
import {
  registerAddressTypeRoutes,
  addressTypeOpenApiPaths,
} from "./common/address-type/routes.ts";
import { createBankNameService } from "./common/bank-name/service.ts";
import {
  registerBankNameRoutes,
  bankNameOpenApiPaths,
} from "./common/bank-name/routes.ts";
import { createContactGroupService } from "./common/contact-group/service.ts";
import {
  registerContactGroupRoutes,
  contactGroupOpenApiPaths,
} from "./common/contact-group/routes.ts";
import { createContactTypeService } from "./common/contact-type/service.ts";
import {
  registerContactTypeRoutes,
  contactTypeOpenApiPaths,
} from "./common/contact-type/routes.ts";
import { createCurrencyService } from "./common/currency/service.ts";
import {
  registerCurrencyRoutes,
  currencyOpenApiPaths,
} from "./common/currency/routes.ts";
import { createMonthService } from "./common/month/service.ts";
import {
  registerMonthRoutes,
  monthOpenApiPaths,
} from "./common/month/routes.ts";
import { createPaymentTermService } from "./common/payment-term/service.ts";
import {
  registerPaymentTermRoutes,
  paymentTermOpenApiPaths,
} from "./common/payment-term/routes.ts";
import { createPriorityService } from "./common/priority/service.ts";
import {
  registerPriorityRoutes,
  priorityOpenApiPaths,
} from "./common/priority/routes.ts";
import { createSalesTypeService } from "./common/sales-type/service.ts";
import {
  registerSalesTypeRoutes,
  salesTypeOpenApiPaths,
} from "./common/sales-type/routes.ts";
import { createBrandService } from "./common/brand/service.ts";
import {
  registerBrandRoutes,
  brandOpenApiPaths,
} from "./common/brand/routes.ts";
import { createColourService } from "./common/colour/service.ts";
import {
  registerColourRoutes,
  colourOpenApiPaths,
} from "./common/colour/routes.ts";
import { createHsnCodeService } from "./common/hsn-code/service.ts";
import {
  registerHsnCodeRoutes,
  hsnCodeOpenApiPaths,
} from "./common/hsn-code/routes.ts";
import { createProductCategoryService } from "./common/product-category/service.ts";
import {
  registerProductCategoryRoutes,
  productCategoryOpenApiPaths,
} from "./common/product-category/routes.ts";
import { createProductGroupService } from "./common/product-group/service.ts";
import {
  registerProductGroupRoutes,
  productGroupOpenApiPaths,
} from "./common/product-group/routes.ts";
import { createProductTypeService } from "./common/product-type/service.ts";
import {
  registerProductTypeRoutes,
  productTypeOpenApiPaths,
} from "./common/product-type/routes.ts";
import { createSizeService } from "./common/size/service.ts";
import { registerSizeRoutes, sizeOpenApiPaths } from "./common/size/routes.ts";
import { createStyleService } from "./common/style/service.ts";
import {
  registerStyleRoutes,
  styleOpenApiPaths,
} from "./common/style/routes.ts";
import { createTaxService } from "./common/tax/service.ts";
import { registerTaxRoutes, taxOpenApiPaths } from "./common/tax/routes.ts";
import { createUnitService } from "./common/unit/service.ts";
import { registerUnitRoutes, unitOpenApiPaths } from "./common/unit/routes.ts";
import { createDestinationService } from "./common/destination/service.ts";
import {
  registerDestinationRoutes,
  destinationOpenApiPaths,
} from "./common/destination/routes.ts";
import { createStockRejectionTypeService } from "./common/stock-rejection-type/service.ts";
import {
  registerStockRejectionTypeRoutes,
  stockRejectionTypeOpenApiPaths,
} from "./common/stock-rejection-type/routes.ts";
import { createTransportService } from "./common/transport/service.ts";
import {
  registerTransportRoutes,
  transportOpenApiPaths,
} from "./common/transport/routes.ts";
import { createWarehouseService } from "./common/warehouse/service.ts";
import {
  registerWarehouseRoutes,
  warehouseOpenApiPaths,
} from "./common/warehouse/routes.ts";
import { createWorkOrderTypeService } from "./common/work-order-type/service.ts";
import {
  registerWorkOrderTypeRoutes,
  workOrderTypeOpenApiPaths,
} from "./common/work-order-type/routes.ts";
import { createCompanyService } from "./master/company/service.ts";
import {
  registerCompanyRoutes,
  companyOpenApiPaths,
} from "./master/company/routes.ts";
import { createFinancialYearService } from "./master/financial-year/service.ts";
import {
  registerFinancialYearRoutes,
  financialYearOpenApiPaths,
} from "./master/financial-year/routes.ts";
import { createContactService } from "./master/contact/service.ts";
import {
  registerContactRoutes,
  contactOpenApiPaths,
} from "./master/contact/routes.ts";
import { createProductService } from "./master/product/service.ts";
import {
  registerProductRoutes,
  productOpenApiPaths,
} from "./master/product/routes.ts";
import { createWorkOrderService } from "./master/work-order/service.ts";
import {
  registerWorkOrderRoutes,
  workOrderOpenApiPaths,
} from "./master/work-order/routes.ts";
import { createDefaultCompanyService } from "./master/default-company/service.ts";
import {
  registerDefaultCompanyRoutes,
  defaultCompanyOpenApiPaths,
} from "./master/default-company/routes.ts";
export function registerCoreModules(
  app: FastifyInstance,
  db: Kysely<Database>,
  resolve: ContextResolver,
) {
  registerOrganisationContextRoutes(app, db, resolve);
  registerCountryRoutes(app, createCountryService(db), resolve);
  registerStateRoutes(app, createStateService(db), resolve);
  registerDistrictRoutes(app, createDistrictService(db), resolve);
  registerCityRoutes(app, createCityService(db), resolve);
  registerPincodeRoutes(app, createPincodeService(db), resolve);
  registerLedgerGroupRoutes(app, createLedgerGroupService(db), resolve);
  registerLedgerRoutes(app, createLedgerService(db), resolve);
  registerAddressTypeRoutes(app, createAddressTypeService(db), resolve);
  registerBankNameRoutes(app, createBankNameService(db), resolve);
  registerContactGroupRoutes(app, createContactGroupService(db), resolve);
  registerContactTypeRoutes(app, createContactTypeService(db), resolve);
  registerCurrencyRoutes(app, createCurrencyService(db), resolve);
  registerMonthRoutes(app, createMonthService(db), resolve);
  registerPaymentTermRoutes(app, createPaymentTermService(db), resolve);
  registerPriorityRoutes(app, createPriorityService(db), resolve);
  registerSalesTypeRoutes(app, createSalesTypeService(db), resolve);
  registerBrandRoutes(app, createBrandService(db), resolve);
  registerColourRoutes(app, createColourService(db), resolve);
  registerHsnCodeRoutes(app, createHsnCodeService(db), resolve);
  registerProductCategoryRoutes(app, createProductCategoryService(db), resolve);
  registerProductGroupRoutes(app, createProductGroupService(db), resolve);
  registerProductTypeRoutes(app, createProductTypeService(db), resolve);
  registerSizeRoutes(app, createSizeService(db), resolve);
  registerStyleRoutes(app, createStyleService(db), resolve);
  registerTaxRoutes(app, createTaxService(db), resolve);
  registerUnitRoutes(app, createUnitService(db), resolve);
  registerDestinationRoutes(app, createDestinationService(db), resolve);
  registerStockRejectionTypeRoutes(
    app,
    createStockRejectionTypeService(db),
    resolve,
  );
  registerTransportRoutes(app, createTransportService(db), resolve);
  registerWarehouseRoutes(app, createWarehouseService(db), resolve);
  registerWorkOrderTypeRoutes(app, createWorkOrderTypeService(db), resolve);
  registerCompanyRoutes(app, createCompanyService(db), resolve);
  registerFinancialYearRoutes(app, createFinancialYearService(db), resolve);
  registerContactRoutes(app, createContactService(db), resolve);
  registerProductRoutes(app, createProductService(db), resolve);
  registerWorkOrderRoutes(app, createWorkOrderService(db), resolve);
  registerDefaultCompanyRoutes(app, createDefaultCompanyService(db), resolve);
}
export const coreOpenApiPaths = {
  ...countryOpenApiPaths,
  ...stateOpenApiPaths,
  ...districtOpenApiPaths,
  ...cityOpenApiPaths,
  ...pincodeOpenApiPaths,
  ...ledgerGroupOpenApiPaths,
  ...ledgerOpenApiPaths,
  ...addressTypeOpenApiPaths,
  ...bankNameOpenApiPaths,
  ...contactGroupOpenApiPaths,
  ...contactTypeOpenApiPaths,
  ...currencyOpenApiPaths,
  ...monthOpenApiPaths,
  ...paymentTermOpenApiPaths,
  ...priorityOpenApiPaths,
  ...salesTypeOpenApiPaths,
  ...brandOpenApiPaths,
  ...colourOpenApiPaths,
  ...hsnCodeOpenApiPaths,
  ...productCategoryOpenApiPaths,
  ...productGroupOpenApiPaths,
  ...productTypeOpenApiPaths,
  ...sizeOpenApiPaths,
  ...styleOpenApiPaths,
  ...taxOpenApiPaths,
  ...unitOpenApiPaths,
  ...destinationOpenApiPaths,
  ...stockRejectionTypeOpenApiPaths,
  ...transportOpenApiPaths,
  ...warehouseOpenApiPaths,
  ...workOrderTypeOpenApiPaths,
  ...companyOpenApiPaths,
  ...financialYearOpenApiPaths,
  ...contactOpenApiPaths,
  ...productOpenApiPaths,
  ...workOrderOpenApiPaths,
  ...defaultCompanyOpenApiPaths,
};
export async function coreSchemaReady(db: Kysely<Database>) {
  try {
    await db.selectFrom("countries").select("public_id").limit(1).execute();
    await db.selectFrom("states").select("public_id").limit(1).execute();
    await db.selectFrom("districts").select("public_id").limit(1).execute();
    await db.selectFrom("cities").select("public_id").limit(1).execute();
    await db.selectFrom("pincodes").select("public_id").limit(1).execute();
    await db.selectFrom("ledger_groups").select("public_id").limit(1).execute();
    await db.selectFrom("ledgers").select("public_id").limit(1).execute();
    await db.selectFrom("address_types").select("public_id").limit(1).execute();
    await db.selectFrom("bank_names").select("public_id").limit(1).execute();
    await db
      .selectFrom("contact_groups")
      .select("public_id")
      .limit(1)
      .execute();
    await db.selectFrom("contact_types").select("public_id").limit(1).execute();
    await db.selectFrom("currencies").select("public_id").limit(1).execute();
    await db.selectFrom("months").select("public_id").limit(1).execute();
    await db.selectFrom("payment_terms").select("public_id").limit(1).execute();
    await db.selectFrom("priorities").select("public_id").limit(1).execute();
    await db.selectFrom("sales_types").select("public_id").limit(1).execute();
    await db.selectFrom("brands").select("public_id").limit(1).execute();
    await db.selectFrom("colours").select("public_id").limit(1).execute();
    await db.selectFrom("hsn_codes").select("public_id").limit(1).execute();
    await db
      .selectFrom("product_categories")
      .select("public_id")
      .limit(1)
      .execute();
    await db
      .selectFrom("product_groups")
      .select("public_id")
      .limit(1)
      .execute();
    await db.selectFrom("product_types").select("public_id").limit(1).execute();
    await db.selectFrom("sizes").select("public_id").limit(1).execute();
    await db.selectFrom("styles").select("public_id").limit(1).execute();
    await db.selectFrom("taxes").select("public_id").limit(1).execute();
    await db.selectFrom("units").select("public_id").limit(1).execute();
    await db.selectFrom("destinations").select("public_id").limit(1).execute();
    await db
      .selectFrom("stock_rejection_types")
      .select("public_id")
      .limit(1)
      .execute();
    await db.selectFrom("transports").select("public_id").limit(1).execute();
    await db.selectFrom("warehouses").select("public_id").limit(1).execute();
    await db
      .selectFrom("work_order_types")
      .select("public_id")
      .limit(1)
      .execute();
    await db.selectFrom("companies").select("public_id").limit(1).execute();
    await db
      .selectFrom("financial_years")
      .select("public_id")
      .limit(1)
      .execute();
    await db.selectFrom("contacts").select("public_id").limit(1).execute();
    await db.selectFrom("products").select("public_id").limit(1).execute();
    await db.selectFrom("work_orders").select("public_id").limit(1).execute();
    await db
      .selectFrom("default_companies")
      .select("public_id")
      .limit(1)
      .execute();
    return true;
  } catch {
    return false;
  }
}
