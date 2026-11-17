import type { Generated, ColumnType } from "kysely";
import type {
  Address,
  PartyEmail,
  PartyPhone,
  BankAccount,
  SocialLink,
} from "../../../../../../contracts/party.ts";
export interface TransportTable {
  id: Generated<number>;
  public_id: string;
  tenant_id: string;
  name: string;
  gst: string;
  vehicle_no: string;
  address: string;
  contact_no: string;
  contact_person: string;
  sort_order: number;
  active: Generated<boolean>;
  created_at: Generated<Date>;
  updated_at: Generated<Date>;
  created_by: string;
  updated_by: string;
  deleted_at: Date | null;
  deleted_by: string | null;
}
