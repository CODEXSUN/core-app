import type {Kysely} from 'kysely';
import type {Database} from '../../database/schema.ts';
import type {ModuleContext} from '../../database/context.ts';
import {requireModulePermission} from '../../database/context.ts';
import {billingContextSelectionSchema,type BillingCoreContext} from '../../../../contracts/billing-context.ts';
import {defaultCompanyValuesSchema} from '../../../../contracts/default-company.ts';
import {contactValuesSchema} from '../../../../contracts/contact.ts';
import {getOrganisationContext} from '../../modules/master/default-company/index.ts';
import {resolveCompanyReference} from '../../modules/master/company/index.ts';
import {resolveFinancialYearReference} from '../../modules/master/financial-year/index.ts';
import {listContactRecords} from '../../modules/master/contact/index.ts';
import {listProductRecords} from '../../modules/master/product/index.ts';
import {listCurrencyRecords} from '../../modules/common/currency/index.ts';

/** One authenticated read; each owning module retains its tenant and permission checks. */
export async function getBillingContext(db:Kysely<Database>,context:ModuleContext,input:unknown):Promise<BillingCoreContext|undefined>{
 const selected=billingContextSelectionSchema.parse(input);
 for(const permission of ['master/default-company:read','master/company:read','master/financial-year:read','master/contact:read','master/product:read','common/currency:read'])requireModulePermission(context,permission);
 const organisation=await getOrganisationContext(db,context);
 if(!organisation)return undefined;
 const [company,financialYear,contacts,products,currencies]=await Promise.all([
  selected.companyId&&selected.companyId!==organisation.company.public_id?resolveCompanyReference(db,context,selected.companyId).then(({id,...record})=>record):organisation.company,
  selected.financialYearId&&selected.financialYearId!==organisation.financialYear.public_id?resolveFinancialYearReference(db,context,selected.financialYearId).then(({id,...record})=>record):organisation.financialYear,
  listContactRecords(db,context),listProductRecords(db,context),listCurrencyRecords(db,context),
 ]);
 return {organisation:{...organisation,defaults:{...organisation.defaults,landingApp:defaultCompanyValuesSchema.shape.landingApp.parse(organisation.defaults.landingApp)}},company,financialYear,contacts:contacts.map(row=>({...row,role:contactValuesSchema.shape.role.parse(row.role)})),products,currencies};
}
