import type { Generated, ColumnType } from "kysely";
import type {
  Address,
  PartyEmail,
  PartyPhone,
  BankAccount,
  SocialLink,
} from "../../../../../../contracts/party.ts";
export interface DefaultCompanyTable {
  id: Generated<number>;
  public_id: string;
  tenant_id: string;
  name: string;
  company_id: number | null;
  financial_year_id: number | null;
  landing_app: string;
  active: Generated<boolean>;
  created_at: Generated<Date>;
  updated_at: Generated<Date>;
  created_by: string;
  updated_by: string;
  deleted_at: Date | null;
  deleted_by: string | null;
}
