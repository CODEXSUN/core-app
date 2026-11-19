import {z} from 'zod';
import type {OrganisationContext} from './organisation-context.ts';
import type {Company} from './company.ts';
import type {FinancialYear} from './financial-year.ts';
import type {Contact} from './contact.ts';
import type {Product} from './product.ts';
import type {Currency} from './currency.ts';

export const billingContextSelectionSchema=z.object({
 companyId:z.string().regex(/^[a-z0-9]{8}$/).optional(),
 financialYearId:z.string().regex(/^[a-z0-9]{8}$/).optional(),
}).strict();
export type BillingContextSelection=z.infer<typeof billingContextSelectionSchema>;
export type BillingCoreContext={organisation:OrganisationContext;company:Company;financialYear:FinancialYear;contacts:Contact[];products:Product[];currencies:Currency[]};
