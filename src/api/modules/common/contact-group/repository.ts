import {pageModuleRecords} from '../../../database/page.ts';
import { randomInt } from "node:crypto";
import { sql, type Kysely } from "kysely";
import type { Database } from "../../../database/schema.ts";
import type { ModuleContext } from "../../../database/context.ts";
import { ConflictError } from "../../../http.ts";
import type { ContactGroupValues } from "../../../../../contracts/contact-group.ts";

const alphabet = "abcdefghijklmnopqrstuvwxyz0123456789";
export function generateContactGroupPublicId() {
  return Array.from(
    { length: 8 },
    () => alphabet[randomInt(alphabet.length)],
  ).join("");
}
function query(db: Kysely<Database>) {
  return db
    .selectFrom("contact_groups")

    .select([
      "contact_groups.id",
      "contact_groups.public_id",
      "contact_groups.name",
      "contact_groups.active",
      "contact_groups.created_at",
      "contact_groups.updated_at",
      "contact_groups.created_by",
      "contact_groups.updated_by",
      "contact_groups.sort_order as sortOrder",
    ] as const);
}
type Row = NonNullable<
  Awaited<ReturnType<ReturnType<typeof query>["executeTakeFirst"]>>
>;
function publicRecord(row: Row) {
  const { id, ...rest } = row;
  return {
    ...rest,

    created_at: row.created_at.toISOString(),
    updated_at: row.updated_at.toISOString(),
  };
}
export async function listContactGroup(
  db: Kysely<Database>,
  context: ModuleContext,
) {
  const rows = await query(db)
    .where("contact_groups.tenant_id", "=", context.tenantId)
    .where("contact_groups.deleted_at", "is", null)
    .orderBy("contact_groups.name")
    .execute();
  return rows.map(publicRecord);
}
export async function findContactGroup(
  db: Kysely<Database>,
  context: ModuleContext,
  publicId: string,
) {
  const row = await query(db)
    .where("contact_groups.tenant_id", "=", context.tenantId)
    .where("contact_groups.public_id", "=", publicId)
    .where("contact_groups.deleted_at", "is", null)
    .executeTakeFirst();
  return row ? publicRecord(row) : undefined;
}
export async function findInternalContactGroup(
  db: Kysely<Database>,
  context: ModuleContext,
  publicId: string,
) {
  const row = await query(db)
    .where("contact_groups.tenant_id", "=", context.tenantId)
    .where("contact_groups.public_id", "=", publicId)
    .where("contact_groups.deleted_at", "is", null)
    .forShare("contact_groups")
    .executeTakeFirst();
  return row ? { ...publicRecord(row), id: row.id } : undefined;
}
async function editable(
  db: Kysely<Database>,
  context: ModuleContext,
  values: ContactGroupValues,
) {
  return {
    name: values.name,
    active: values.active,
    sort_order: values.sortOrder,
  };
}
export async function insertContactGroup(
  db: Kysely<Database>,
  context: ModuleContext,
  values: ContactGroupValues,
  generate = generateContactGroupPublicId,
) {
  for (let attempt = 0; attempt < 5; attempt++) {
    try {
      const publicId = generate();
      await db.transaction().execute(async (transaction) => {
        const data = await editable(transaction, context, values);
        await transaction
          .insertInto("contact_groups")
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
      const saved = await findContactGroup(db, context, publicId);
      if (!saved) throw new Error("Saved record could not be read.");
      return saved;
    } catch (error) {
      const failure = error as { code?: string; constraint?: string };
      if (
        failure.code !== "23505" ||
        failure.constraint !== "contact_groups_public_id_unique"
      )
        throw error;
      if (attempt === 4) throw new Error("Unable to allocate a public ID.");
    }
  }
  throw new Error("Unable to allocate a public ID.");
}
export async function updateContactGroup(
  db: Kysely<Database>,
  context: ModuleContext,
  publicId: string,
  values: ContactGroupValues,
) {
  const changed = await db.transaction().execute(async (transaction) => {
    const existing = await transaction
      .selectFrom("contact_groups")
      .selectAll()
      .where("tenant_id", "=", context.tenantId)
      .where("public_id", "=", publicId)
      .where("deleted_at", "is", null)
      .forUpdate()
      .executeTakeFirst();
    if (!existing) return false;
    const data = await editable(transaction, context, values);
    await transaction
      .updateTable("contact_groups")
      .set({ ...data, updated_at: new Date(), updated_by: context.actorId })
      .where("id", "=", existing.id)
      .where("tenant_id", "=", context.tenantId)
      .execute();
    return true;
  });
  return changed ? findContactGroup(db, context, publicId) : undefined;
}

export async function pageContactGroupRecords(db:Kysely<Database>,context:ModuleContext,input:unknown){
 const result=await pageModuleRecords(db,query(db).where('contact_groups.tenant_id','=',context.tenantId).where('contact_groups.deleted_at','is',null),input,{"name":{"field":"name"},"sortOrder":{"field":"sortOrder"},"active":{"field":"active","boolean":true}});
 return result;
}
