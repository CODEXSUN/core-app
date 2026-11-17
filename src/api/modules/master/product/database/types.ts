import type { Generated, ColumnType } from "kysely";
import type {
  Address,
  PartyEmail,
  PartyPhone,
  BankAccount,
  SocialLink,
} from "../../../../../../contracts/party.ts";
export interface ProductTable {
  id: Generated<number>;
  public_id: string;
  tenant_id: string;
  name: string;
  type_id: number | null;
  product_category_id: number | null;
  product_group_id: number | null;
  hsn_code_id: number | null;
  unit_id: number | null;
  tax_id: number | null;
  brand_id: number | null;
  opening_stock: string;
  opening_rate: string;
  description: string;
  active: Generated<boolean>;
  created_at: Generated<Date>;
  updated_at: Generated<Date>;
  created_by: string;
  updated_by: string;
  deleted_at: Date | null;
  deleted_by: string | null;
}
