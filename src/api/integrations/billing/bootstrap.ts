import type {Kysely} from 'kysely';
import type {Database} from '../../database/schema.ts';
import type {ModuleContext} from '../../database/context.ts';
import {requireModulePermission} from '../../database/context.ts';
import {billingBootstrapQuerySchema,type BillingBootstrap,type BillingCompany,type BillingFinancialYear,type BillingSetupStatus} from '../../../../contracts/billing-catalog.ts';
import {getOrganisationContext} from '../../modules/master/default-company/index.ts';
import {resolveCompanyReference} from '../../modules/master/company/index.ts';
import {resolveFinancialYearReference} from '../../modules/master/financial-year/index.ts';
import {lookupBillingCurrencies,hasActiveCurrency} from '../../modules/common/currency/index.ts';
import {hasActiveUnit} from '../../modules/common/unit/index.ts';
import {hasActiveTax} from '../../modules/common/tax/index.ts';
const companyDto=(record:BillingCompany):BillingCompany=>({public_id:record.public_id,name:record.name,active:record.active});
const yearDto=(record:BillingFinancialYear):BillingFinancialYear=>({public_id:record.public_id,name:record.name,startDate:record.startDate,endDate:record.endDate,active:record.active});
export async function getBillingSetupStatus(db:Kysely<Database>,context:ModuleContext):Promise<BillingSetupStatus>{
 // Match the four original reads, including conditional company/year checks after a default exists.
 for(const permission of ['master/default-company:read','common/unit:read','common/currency:read','common/tax:read'])requireModulePermission(context,permission);
 const [org,units,currencies,taxes]=await Promise.all([getOrganisationContext(db,context),hasActiveUnit(db,context),hasActiveCurrency(db,context),hasActiveTax(db,context)]);
 return {organisationReady:!!org&&org.defaults.active&&org.company.active&&org.financialYear.active&&org.defaults.companyId===org.company.public_id&&org.defaults.financialYearId===org.financialYear.public_id,references:{units,currencies,taxes}};
}
export async function getBillingBootstrap(db:Kysely<Database>,context:ModuleContext,input:unknown):Promise<BillingBootstrap|undefined>{
 const selected=billingBootstrapQuerySchema.parse(input);
 for(const permission of ['master/default-company:read','master/company:read','master/financial-year:read','common/currency:read'])requireModulePermission(context,permission);
 const org=await getOrganisationContext(db,context);if(!org)return undefined;
 const [company,financialYear,currencies]=await Promise.all([
  selected.companyId&&selected.companyId!==org.company.public_id?resolveCompanyReference(db,context,selected.companyId):org.company,
  selected.financialYearId&&selected.financialYearId!==org.financialYear.public_id?resolveFinancialYearReference(db,context,selected.financialYearId):org.financialYear,
  lookupBillingCurrencies(db,context,selected.currencyCodes),
 ]);
 const {public_id,name,companyId,financialYearId,active}=org.defaults;
 return {organisation:{defaults:{public_id,name,companyId,financialYearId,active},company:companyDto(org.company),financialYear:yearDto(org.financialYear)},company:companyDto(company),financialYear:yearDto(financialYear),currencies,requestedCurrencyCodes:selected.currencyCodes};
}
