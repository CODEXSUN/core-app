import { randomInt } from "node:crypto";
import { sql, type Kysely } from "kysely";
import type { Database } from "../../../database/schema.ts";
import type { ModuleContext } from "../../../database/context.ts";
import { ConflictError } from "../../../http.ts";
import type { ContactValues } from "../../../../../contracts/contact.ts";
import { resolveContactTypeReference } from "../../common/contact-type/index.ts";
import { resolveContactGroupReference } from "../../common/contact-group/index.ts";
import { validatePartyReferences } from "../../../party-references.ts";
const alphabet = "abcdefghijklmnopqrstuvwxyz0123456789";
export function generateContactPublicId() {
  return Array.from(
    { length: 8 },
    () => alphabet[randomInt(alphabet.length)],
  ).join("");
}
function query(db: Kysely<Database>) {
  return db
    .selectFrom("contacts")
    .leftJoin("contact_types as typeIdRef", (join) =>
      join
        .onRef("typeIdRef.id", "=", "contacts.type_id")
        .onRef("typeIdRef.tenant_id", "=", "contacts.tenant_id"),
    )
    .leftJoin("contact_groups as groupIdRef", (join) =>
      join
        .onRef("groupIdRef.id", "=", "contacts.group_id")
        .onRef("groupIdRef.tenant_id", "=", "contacts.tenant_id"),
    )
    .select([
      "contacts.id",
      "contacts.public_id",
      "contacts.name",
      "contacts.active",
      "contacts.created_at",
      "contacts.updated_at",
      "contacts.created_by",
      "contacts.updated_by",
      "contacts.code",
      "contacts.legal_name as legalName",
      "contacts.role",
      "contacts.gstin",
      "contacts.pan",
      "contacts.website",
      "contacts.description",
      "contacts.msme_no as msmeNo",
      "contacts.msme_category as msmeCategory",
      "contacts.tan_no as tanNo",
      "contacts.tds_available as tdsAvailable",
      "contacts.tcs_available as tcsAvailable",
      "contacts.credit_limit as creditLimit",
      "contacts.emails",
      "contacts.phones",
      "contacts.addresses",
      "contacts.bank_accounts as bankAccounts",
      "contacts.social_links as socialLinks",
      "typeIdRef.public_id as typeId",
      "typeIdRef.name as typeName",
      "groupIdRef.public_id as groupId",
      "groupIdRef.name as groupName",
    ] as const);
}
type Row = NonNullable<
  Awaited<ReturnType<ReturnType<typeof query>["executeTakeFirst"]>>
>;
function publicRecord(row: Row) {
  const { id, ...rest } = row;
  return {
    ...rest,
    typeId: row.typeId ?? "",
    typeName: row.typeName ?? "",
    groupId: row.groupId ?? "",
    groupName: row.groupName ?? "",
    created_at: row.created_at.toISOString(),
    updated_at: row.updated_at.toISOString(),
  };
}
export async function listContact(
  db: Kysely<Database>,
  context: ModuleContext,
) {
  const rows = await query(db)
    .where("contacts.tenant_id", "=", context.tenantId)
    .where("contacts.deleted_at", "is", null)
    .orderBy("contacts.name")
    .execute();
  return rows.map(publicRecord);
}
export async function findContact(
  db: Kysely<Database>,
  context: ModuleContext,
  publicId: string,
) {
  const row = await query(db)
    .where("contacts.tenant_id", "=", context.tenantId)
    .where("contacts.public_id", "=", publicId)
    .where("contacts.deleted_at", "is", null)
    .executeTakeFirst();
  return row ? publicRecord(row) : undefined;
}
export async function findInternalContact(
  db: Kysely<Database>,
  context: ModuleContext,
  publicId: string,
) {
  const row = await query(db)
    .where("contacts.tenant_id", "=", context.tenantId)
    .where("contacts.public_id", "=", publicId)
    .where("contacts.deleted_at", "is", null)
    .forShare("contacts")
    .executeTakeFirst();
  return row ? { ...publicRecord(row), id: row.id } : undefined;
}
async function editable(
  db: Kysely<Database>,
  context: ModuleContext,
  values: ContactValues,
) {
  const typeId = values.typeId
    ? await resolveContactTypeReference(db, context, values.typeId)
    : null;
  if (
    typeId?.name.trim().toLowerCase() === "customer" &&
    !["customer", "both"].includes(values.role)
  )
    throw new ConflictError(
      "Customer contact type requires customer or both role.",
    );
  if (
    typeId?.name.trim().toLowerCase() === "supplier" &&
    !["supplier", "both"].includes(values.role)
  )
    throw new ConflictError(
      "Supplier contact type requires supplier or both role.",
    );
  const groupId = values.groupId
    ? await resolveContactGroupReference(db, context, values.groupId)
    : null;
  await validatePartyReferences(db, context, values);
  return {
    name: values.name,
    active: values.active,
    code: values.code,
    legal_name: values.legalName,
    role: values.role,
    type_id: typeId?.id ?? null,
    group_id: groupId?.id ?? null,
    gstin: values.gstin,
    pan: values.pan,
    website: values.website,
    description: values.description,
    msme_no: values.msmeNo,
    msme_category: values.msmeCategory,
    tan_no: values.tanNo,
    tds_available: values.tdsAvailable,
    tcs_available: values.tcsAvailable,
    credit_limit: values.creditLimit,
    emails: JSON.stringify(values.emails),
    phones: JSON.stringify(values.phones),
    addresses: JSON.stringify(values.addresses),
    bank_accounts: JSON.stringify(values.bankAccounts),
    social_links: JSON.stringify(values.socialLinks),
  };
}
export async function insertContact(
  db: Kysely<Database>,
  context: ModuleContext,
  values: ContactValues,
  generate = generateContactPublicId,
) {
  for (let attempt = 0; attempt < 5; attempt++) {
    try {
      const publicId = generate();
      await db.transaction().execute(async (transaction) => {
        const data = await editable(transaction, context, values);
        await transaction
          .insertInto("contacts")
          .values({
            ...data,
            public_id: publicId,
            tenant_id: context.tenantId,
            created_by: context.actorId,
            updated_by: context.actorId,
            deleted_at: null,
            deleted_by: null,
          })
          .execute();
      });
      const saved = await findContact(db, context, publicId);
      if (!saved) throw new Error("Saved record could not be read.");
      return saved;
    } catch (error) {
      const failure = error as { code?: string; constraint?: string };
      if (
        failure.code !== "23505" ||
        failure.constraint !== "contacts_public_id_unique"
      )
        throw error;
      if (attempt === 4) throw new Error("Unable to allocate a public ID.");
    }
  }
  throw new Error("Unable to allocate a public ID.");
}
export async function updateContact(
  db: Kysely<Database>,
  context: ModuleContext,
  publicId: string,
  values: ContactValues,
) {
  const changed = await db.transaction().execute(async (transaction) => {
    const existing = await transaction
      .selectFrom("contacts")
      .selectAll()
      .where("tenant_id", "=", context.tenantId)
      .where("public_id", "=", publicId)
      .where("deleted_at", "is", null)
      .forUpdate()
      .executeTakeFirst();
    if (!existing) return false;
    const data = await editable(transaction, context, values);
    await transaction
      .updateTable("contacts")
      .set({ ...data, updated_at: new Date(), updated_by: context.actorId })
      .where("id", "=", existing.id)
      .where("tenant_id", "=", context.tenantId)
      .execute();
    return true;
  });
  return changed ? findContact(db, context, publicId) : undefined;
}
