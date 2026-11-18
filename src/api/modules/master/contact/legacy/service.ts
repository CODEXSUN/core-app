import {
  legacyContactValuesSchema,
  legacyPublicId,
  type LegacySqlTransaction,
  type LegacyContactScope,
} from "../../../../../../contracts/legacy-contact.ts";
import {
  contactDetail,
  contactOptions,
  saveContact,
  LegacyContactError,
} from "./repository.ts";
/** Core-owned public host port; callers supply a verified, tenant-bound transaction. */
export function createLegacyContactPort(
  tx: LegacySqlTransaction,
  scope: LegacyContactScope,
) {
  const allow = (operation: "read" | "create" | "update") => {
    if (!scope.tenantId || scope.tenantId !== scope.boundTenantId)
      throw new LegacyContactError(
        403,
        "Contact store belongs to another tenant.",
      );
    scope.authorize(operation);
  };
  return {
    async get(id: string) {
      allow("read");
      legacyPublicId.parse(id);
      const row = await contactDetail(tx, id);
      if (!row) throw new LegacyContactError(404, "Contact was not found.");
      return row;
    },
    async options() {
      allow("read");
      return contactOptions(tx);
    },
    async lookup() {
      allow("read");
      return tx.query<{ public_id: string; name: string }>(
        "select uuid public_id,name from core_contacts where status='active' and deleted_at is null order by name",
      );
    },
    async identity(id: string) {
      allow("read");
      legacyPublicId.parse(id);
      const row = (
        await tx.query<{
          id: number;
          name: string;
          primary_phone: string | null;
        }>(
          "select id,name,primary_phone from core_contacts where uuid=? and status='active' and deleted_at is null",
          [id],
        )
      )[0];
      if (!row) throw new LegacyContactError(400, "Select an active contact.");
      return row;
    },
    async resolveCustomer(name: string, phone: string) {
      allow("read");
      const mobile = phone.trim();
      if (mobile && !/^\d{10}$/.test(mobile))
        throw new LegacyContactError(400, "Enter a 10-digit mobile number.");
      if (mobile) {
        const matches = await tx.query<{
          id: number;
          uuid: string;
          status: string;
        }>(
          "select distinct c.id,c.uuid,c.status from core_contacts c left join core_contacts_phones p on p.parent_id=c.id where c.deleted_at is null and (regexp_replace(coalesce(p.phone,''),'[^0-9]','')=? or regexp_replace(coalesce(c.primary_phone,''),'[^0-9]','')=?)",
          [mobile, mobile],
        );
        if (matches.length > 1)
          throw new LegacyContactError(
            409,
            "More than one contact uses this mobile. Select a contact.",
          );
        if (matches.length) {
          if (matches[0].status !== "active")
            throw new LegacyContactError(
              409,
              "This mobile belongs to an inactive contact.",
            );
          return matches[0].id;
        }
      }
      allow("create");
      if (!name.trim() && !mobile)
        throw new LegacyContactError(400, "Enter a customer name or mobile.");
      const type = (
        await tx.query<{ uuid: string }>(
          "select uuid from core_contact_types where lower(name)='customer' and status='active'",
        )
      )[0];
      if (!type)
        throw new LegacyContactError(
          400,
          "Set up an active Customer contact type.",
        );
      const record = await saveContact(tx, scope.actorEmail, {
        name: name.trim() || mobile,
        code: "",
        legalName: "",
        typeId: type.uuid,
        groupId: "",
        gstin: "",
        pan: "",
        msmeNo: "",
        msmeCategory: "",
        tanNo: "",
        tdsAvailable: false,
        tcsAvailable: false,
        openingBalance: "0.00",
        creditLimit: "0.00",
        website: "",
        description: "",
        active: true,
        phones: mobile
          ? [{ phone: mobile, phoneType: "Mobile", isPrimary: true }]
          : [],
        emails: [],
        addresses: [],
        bankAccounts: [],
        socialLinks: [],
      });
      return (
        await tx.query<{ id: number }>(
          "select id from core_contacts where uuid=?",
          [record.public_id],
        )
      )[0].id;
    },
    async save(input: unknown, id?: string, revision?: string) {
      allow(id ? "update" : "create");
      if (id) legacyPublicId.parse(id);
      return saveContact(
        tx,
        scope.actorEmail,
        legacyContactValuesSchema.parse(input),
        id,
        revision,
      );
    },
  };
}
