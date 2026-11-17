import type { Generated, ColumnType } from "kysely";
import type {
  Address,
  PartyEmail,
  PartyPhone,
  BankAccount,
  SocialLink,
} from "../../../../../../contracts/party.ts";
export interface CompanyTable {
  id: Generated<number>;
  public_id: string;
  tenant_id: string;
  name: string;
  code: string;
  legal_name: string;
  gstin: string;
  pan: string;
  website: string;
  description: string;
  msme_no: string;
  msme_category: string;
  tan_no: string;
  tds_available: boolean;
  tcs_available: boolean;
  logo_url: string;
  logo_dark_url: string;
  favicon_url: string;
  industry_name: string;
  emails: ColumnType<PartyEmail[], string, string>;
  phones: ColumnType<PartyPhone[], string, string>;
  addresses: ColumnType<Address[], string, string>;
  bank_accounts: ColumnType<BankAccount[], string, string>;
  social_links: ColumnType<SocialLink[], string, string>;
  active: Generated<boolean>;
  created_at: Generated<Date>;
  updated_at: Generated<Date>;
  created_by: string;
  updated_by: string;
  deleted_at: Date | null;
  deleted_by: string | null;
}
