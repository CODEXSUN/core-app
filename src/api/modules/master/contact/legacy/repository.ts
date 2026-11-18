import { createHash, randomBytes } from "node:crypto";
import type {
  LegacySqlTransaction,
  LegacyContactDetail,
  LegacyContactValues,
  LegacyContactOptions,
} from "../../../../../../contracts/legacy-contact.ts";
type Row = Record<string, any>;
export class LegacyContactError extends Error {
  statusCode: number;
  constructor(statusCode: number, message: string) {
    super(message);
    this.statusCode = statusCode;
  }
}
export function revision(value: unknown) {
  return createHash("sha256").update(JSON.stringify(value)).digest("hex");
}
const empty = (value: unknown) =>
  value === null || value === undefined ? "" : String(value);
export async function contactDetail(
  tx: LegacySqlTransaction,
  publicId: string,
  lock = false,
): Promise<LegacyContactDetail | null> {
  const rows = await tx.query<Row>(
    `select c.*,t.uuid type_ref,g.uuid group_ref from core_contacts c left join core_contact_types t on t.id=c.type_id left join core_contact_groups g on g.id=c.group_id where c.uuid=? and c.deleted_at is null${lock ? " for update" : ""}`,
    [publicId],
  );
  const row = rows[0];
  if (!row) return null;
  const [phones, emails, addresses, banks, social] = await Promise.all([
    tx.query<Row>(
      "select * from core_contacts_phones where parent_id=? order by sort_order,id",
      [row.id],
    ),
    tx.query<Row>(
      "select * from core_contacts_emails where parent_id=? order by sort_order,id",
      [row.id],
    ),
    tx.query<Row>(
      `select a.*,t.uuid type_ref,co.uuid country_ref,s.uuid state_ref,d.uuid district_ref,c.uuid city_ref,p.uuid pincode_ref from core_contacts_addresses a left join core_address_types t on t.id=a.address_type_id left join core_countries co on co.id=a.country_id left join core_states s on s.id=a.state_id left join core_districts d on d.id=a.district_id left join core_cities c on c.id=a.city_id left join core_pincodes p on p.id=a.pincode_id where a.parent_id=? order by a.sort_order,a.id`,
      [row.id],
    ),
    tx.query<Row>(
      "select a.*,b.uuid bank_ref from core_contacts_bank_accounts a left join core_bank_names b on b.id=a.bank_name_id where a.parent_id=? order by a.sort_order,a.id",
      [row.id],
    ),
    tx.query<Row>(
      "select * from core_contacts_social_links where parent_id=? order by sort_order,id",
      [row.id],
    ),
  ]);
  const result = {
    public_id: row.uuid,
    name: row.name,
    code: row.code,
    legalName: empty(row.legal_name),
    typeId: empty(row.type_ref),
    groupId: empty(row.group_ref),
    typeName: empty(row.type_name),
    groupName: empty(row.group_name),
    gstin: empty(row.gstin),
    pan: empty(row.pan),
    msmeNo: empty(row.msme_no),
    msmeCategory: empty(row.msme_category),
    tanNo: empty(row.tan_no),
    tdsAvailable: !!row.tds_available,
    tcsAvailable: !!row.tcs_available,
    openingBalance: String(row.opening_balance),
    creditLimit: String(row.credit_limit),
    website: empty(row.website),
    description: empty(row.description),
    active: row.status === "active",
    phones: phones.map((v) => ({
      public_id: v.uuid,
      phone: v.phone,
      phoneType: v.phone_type,
      isPrimary: !!v.is_primary,
    })),
    emails: emails.map((v) => ({
      public_id: v.uuid,
      email: v.email,
      emailType: v.email_type,
      isPrimary: !!v.is_primary,
    })),
    addresses: addresses.map((v) => ({
      public_id: v.uuid,
      addressTypeId: empty(v.type_ref),
      addressLine1: v.address_line1,
      addressLine2: empty(v.address_line2),
      countryId: empty(v.country_ref),
      stateId: empty(v.state_ref),
      districtId: empty(v.district_ref),
      cityId: empty(v.city_ref),
      pincodeId: empty(v.pincode_ref),
      isDefault: !!v.is_default,
    })),
    bankAccounts: banks.map((v) => ({
      public_id: v.uuid,
      bankNameId: empty(v.bank_ref),
      accountType: empty(v.account_type),
      accountNumber: v.account_number,
      holderName: empty(v.holder_name),
      ifsc: empty(v.ifsc),
      branch: empty(v.branch),
      isPrimary: !!v.is_primary,
    })),
    socialLinks: social.map((v) => ({
      public_id: v.uuid,
      platform: v.platform,
      url: v.url,
      active: v.status === "active",
    })),
    createdBy: row.created_by,
    createdAt: String(row.created_at),
    updatedAt: String(row.updated_at),
  } as Omit<LegacyContactDetail, "revision">;
  return { ...result, revision: revision(result) };
}
export async function contactOptions(
  tx: LegacySqlTransaction,
): Promise<LegacyContactOptions> {
  const simple = async (table: string) =>
    tx.query<any>(
      `select uuid public_id,name,status='active' active from ${table} order by sort_order,name`,
    );
  const options = await Promise.all([
    simple("core_contact_types"),
    simple("core_contact_groups"),
    simple("core_address_types"),
    simple("core_bank_names"),
    simple("core_countries"),
    tx.query<any>(
      `select t.uuid public_id,t.name,t.status='active' active,p.uuid parentId from core_states t join core_countries p on p.id=t.country_id order by t.name`,
    ),
    tx.query<any>(
      `select t.uuid public_id,t.name,t.status='active' active,p.uuid parentId from core_districts t join core_states p on p.id=t.state_id order by t.name`,
    ),
    tx.query<any>(
      `select t.uuid public_id,t.name,t.status='active' active,p.uuid parentId from core_cities t join core_districts p on p.id=t.district_id order by t.name`,
    ),
    tx.query<any>(
      `select t.uuid public_id,concat(t.name,' ',t.area) name,t.status='active' active,p.uuid parentId from core_pincodes t join core_cities p on p.id=t.city_id order by t.name`,
    ),
  ]);
  return Object.fromEntries(
    [
      "types",
      "groups",
      "addressTypes",
      "banks",
      "countries",
      "states",
      "districts",
      "cities",
      "pincodes",
    ].map((key, index) => [
      key,
      options[index].map((row) => ({ ...row, active: !!row.active })),
    ]),
  ) as LegacyContactOptions;
}
async function reference(
  tx: LegacySqlTransaction,
  table: string,
  id: string,
  prior: string | undefined,
  required = false,
) {
  if (!id) {
    if (required) throw new LegacyContactError(400, "Select a contact type.");
    return null;
  }
  const row = (
    await tx.query<Row>(`select * from ${table} where uuid=?`, [id])
  )[0];
  if (!row || (row.status !== "active" && id !== prior))
    throw new LegacyContactError(
      400,
      "A selected reference is missing or inactive.",
    );
  return row;
}
async function childRows(
  tx: LegacySqlTransaction,
  table: string,
  parent: number,
  rows: Row[],
  actor: string,
) {
  const existing = await tx.query<Row>(
    `select uuid from ${table} where parent_id=? for update`,
    [parent],
  );
  const allowed = new Set(existing.map((v) => v.uuid));
  const retained: string[] = [];
  for (const [index, { public_id, ...data }] of rows.entries()) {
    const uuid = public_id || randomBytes(4).toString("hex");
    if (public_id && !allowed.has(public_id))
      throw new LegacyContactError(
        400,
        "A related entry does not belong to this contact.",
      );
    if (retained.includes(uuid))
      throw new LegacyContactError(400, "A related entry was supplied twice.");
    retained.push(uuid);
    const values = { ...data, sort_order: index + 1 };
    const keys = Object.keys(values);
    if (public_id)
      await tx.query(
        `update ${table} set ${keys.map((k) => "`" + k + "`=?").join(",")} where parent_id=? and uuid=?`,
        [...Object.values(values), parent, uuid],
      );
    else
      await tx.query(
        `insert into ${table}(uuid,parent_id,created_by,${keys.map((k) => "`" + k + "`").join(",")}) values (${Array(
          keys.length + 3,
        )
          .fill("?")
          .join(",")})`,
        [uuid, parent, actor, ...Object.values(values)],
      );
  }
  await tx.query(
    `delete from ${table} where parent_id=?${retained.length ? " and uuid not in (" + retained.map(() => "?").join(",") + ")" : ""}`,
    [parent, ...retained],
  );
}
export async function saveContact(
  tx: LegacySqlTransaction,
  actor: string,
  values: LegacyContactValues,
  publicId?: string,
  expectedRevision?: string,
) {
  const current = publicId ? await contactDetail(tx, publicId, true) : null;
  if (publicId && !current)
    throw new LegacyContactError(404, "Contact was not found.");
  if (current && current.revision !== expectedRevision)
    throw new LegacyContactError(
      409,
      "This contact changed. Reload it before saving.",
    );
  if (current?.name.trim() === "-")
    throw new LegacyContactError(403, "The default contact is protected.");
  const linkedCode =
    current &&
    (/^(EXT-[a-f0-9]{64})$/i.test(current.code) ||
      /^(?:C\d{2,}|SUPP[-_]?[A-Z0-9]+)$/i.test(current.code.trim()));
  if (
    current &&
    linkedCode &&
    values.code.trim().toUpperCase() !== current.code.toUpperCase()
  )
    throw new LegacyContactError(
      409,
      "An externally linked contact code cannot change.",
    );
  const type = await reference(
    tx,
    "core_contact_types",
    values.typeId,
    current?.typeId,
    true,
  );
  const group = await reference(
    tx,
    "core_contact_groups",
    values.groupId,
    current?.groupId,
  );
  const codes = await tx.query<Row>(
    "select code from core_contacts order by id for update",
  );
  const normalizedCode = values.code
    .trim()
    .toUpperCase()
    .replace(/[^A-Z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
  if (values.code.trim() && !normalizedCode)
    throw new LegacyContactError(400, "Enter a valid contact code.");
  const code =
    (linkedCode ? current!.code : normalizedCode) ||
    "C-" +
      String(
        1 +
          codes.reduce(
            (max, row) =>
              Math.max(max, Number(/^C[-_](\d+)$/i.exec(row.code)?.[1] ?? 0)),
            0,
          ),
      ).padStart(4, "0");
  const duplicate = (
    await tx.query("select id from core_contacts where code=? and uuid<>?", [
      code,
      publicId ?? "",
    ])
  )[0];
  if (duplicate)
    throw new LegacyContactError(409, "This contact code is already used.");
  for (const row of values.phones) {
    if (
      (
        await tx.query(
          `select c.id from core_contacts c left join core_contacts_phones p on p.parent_id=c.id where (regexp_replace(coalesce(p.phone,''),'[^0-9]','')=? or regexp_replace(coalesce(c.primary_phone,''),'[^0-9]','')=?) and c.uuid<>? and c.deleted_at is null`,
          [
            row.phone.replace(/\D/g, ""),
            row.phone.replace(/\D/g, ""),
            publicId ?? "",
          ],
        )
      ).length
    )
      throw new LegacyContactError(
        409,
        "This phone number belongs to another contact.",
      );
  }
  for (const row of values.emails) {
    if (
      (
        await tx.query(
          `select p.id from core_contacts_emails p join core_contacts c on c.id=p.parent_id where lower(p.email)=? and c.uuid<>? and c.deleted_at is null`,
          [row.email.toLowerCase(), publicId ?? ""],
        )
      ).length
    )
      throw new LegacyContactError(
        409,
        "This email belongs to another contact.",
      );
  }
  const uuid = publicId ?? randomBytes(4).toString("hex");
  const row = {
    code,
    name: values.name,
    legal_name: values.legalName || null,
    type_id: type!.id,
    type_name: type!.name,
    group_id: group?.id ?? null,
    group_name: group?.name ?? null,
    primary_phone: values.phones.find((v) => v.isPrimary)?.phone ?? null,
    primary_email: values.emails.find((v) => v.isPrimary)?.email ?? null,
    gstin: values.gstin || null,
    pan: values.pan || null,
    msme_no: values.msmeNo || null,
    msme_category: values.msmeCategory || null,
    tan_no: values.tanNo || null,
    tds_available: values.tdsAvailable,
    tcs_available: values.tcsAvailable,
    opening_balance: values.openingBalance,
    credit_limit: values.creditLimit,
    website: values.website || null,
    description: values.description || null,
    status: values.active ? "active" : "suspend",
  };
  const keys = Object.keys(row);
  if (current)
    await tx.query(
      `update core_contacts set ${keys.map((k) => "`" + k + "`=?").join(",")},updated_at=utc_timestamp() where uuid=?`,
      [...Object.values(row), uuid],
    );
  else
    await tx.query(
      `insert into core_contacts(uuid,created_by,${keys.map((k) => "`" + k + "`").join(",")}) values (${Array(
        keys.length + 2,
      )
        .fill("?")
        .join(",")})`,
      [uuid, actor, ...Object.values(row)],
    );
  const parent = (
    await tx.query<Row>("select id from core_contacts where uuid=?", [uuid])
  )[0].id;
  await childRows(
    tx,
    "core_contacts_phones",
    parent,
    values.phones.map((v) => ({
      public_id: v.public_id,
      phone: v.phone,
      phone_type: v.phoneType,
      is_primary: v.isPrimary,
    })),
    actor,
  );
  await childRows(
    tx,
    "core_contacts_emails",
    parent,
    values.emails.map((v) => ({
      public_id: v.public_id,
      email: v.email,
      email_type: v.emailType,
      is_primary: v.isPrimary,
    })),
    actor,
  );
  const addresses: Row[] = [];
  for (const value of values.addresses) {
    const prior = current?.addresses.find(
      (v) => v.public_id === value.public_id,
    );
    const [kind, country, state, district, city, pincode] = await Promise.all([
      reference(
        tx,
        "core_address_types",
        value.addressTypeId,
        prior?.addressTypeId,
      ),
      reference(tx, "core_countries", value.countryId, prior?.countryId),
      reference(tx, "core_states", value.stateId, prior?.stateId),
      reference(tx, "core_districts", value.districtId, prior?.districtId),
      reference(tx, "core_cities", value.cityId, prior?.cityId),
      reference(tx, "core_pincodes", value.pincodeId, prior?.pincodeId),
    ]);
    if (
      (state && state.country_id !== country?.id) ||
      (district && district.state_id !== state?.id) ||
      (city && city.district_id !== district?.id) ||
      (pincode && pincode.city_id !== city?.id)
    )
      throw new LegacyContactError(
        400,
        "Select a consistent country, state, district, city and pincode.",
      );
    addresses.push({
      public_id: value.public_id,
      address_type_id: kind?.id ?? null,
      address_type_name: kind?.name ?? null,
      address_line1: value.addressLine1,
      address_line2: value.addressLine2 || null,
      country_id: country?.id ?? null,
      country_name: country?.name ?? null,
      state_id: state?.id ?? null,
      state_name: state?.name ?? null,
      district_id: district?.id ?? null,
      district_name: district?.name ?? null,
      city_id: city?.id ?? null,
      city_name: city?.name ?? null,
      pincode_id: pincode?.id ?? null,
      pincode_name: pincode?.name ?? null,
      is_default: value.isDefault,
    });
  }
  await childRows(tx, "core_contacts_addresses", parent, addresses, actor);
  const banks: Row[] = [];
  for (const value of values.bankAccounts) {
    const bank = await reference(
      tx,
      "core_bank_names",
      value.bankNameId,
      current?.bankAccounts.find((v) => v.public_id === value.public_id)
        ?.bankNameId,
    );
    banks.push({
      public_id: value.public_id,
      bank_name_id: bank?.id ?? null,
      bank_name: bank?.name ?? null,
      account_type: value.accountType || null,
      account_number: value.accountNumber,
      holder_name: value.holderName || null,
      ifsc: value.ifsc || null,
      branch: value.branch || null,
      is_primary: value.isPrimary,
    });
  }
  await childRows(tx, "core_contacts_bank_accounts", parent, banks, actor);
  await childRows(
    tx,
    "core_contacts_social_links",
    parent,
    values.socialLinks.map((v) => ({
      public_id: v.public_id,
      platform: v.platform,
      url: v.url,
      status: v.active ? "active" : "inactive",
    })),
    actor,
  );
  return (await contactDetail(tx, uuid))!;
}
