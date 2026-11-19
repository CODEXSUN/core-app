import {pageModuleRecords} from '../../../database/page.ts';
import { randomInt } from "node:crypto";
import { sql, type Kysely } from "kysely";
import type { Database } from "../../../database/schema.ts";
import type { ModuleContext } from "../../../database/context.ts";
import { ConflictError } from "../../../http.ts";
import type { ColourValues } from "../../../../../contracts/colour.ts";

const alphabet = "abcdefghijklmnopqrstuvwxyz0123456789";
export function generateColourPublicId() {
  return Array.from(
    { length: 8 },
    () => alphabet[randomInt(alphabet.length)],
  ).join("");
}
function query(db: Kysely<Database>) {
  return db
    .selectFrom("colours")

    .select([
      "colours.id",
      "colours.public_id",
      "colours.name",
      "colours.active",
      "colours.created_at",
      "colours.updated_at",
      "colours.created_by",
      "colours.updated_by",
      "colours.sort_order as sortOrder",
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
export async function listColour(db: Kysely<Database>, context: ModuleContext) {
  const rows = await query(db)
    .where("colours.tenant_id", "=", context.tenantId)
    .where("colours.deleted_at", "is", null)
    .orderBy("colours.name")
    .execute();
  return rows.map(publicRecord);
}
export async function findColour(
  db: Kysely<Database>,
  context: ModuleContext,
  publicId: string,
) {
  const row = await query(db)
    .where("colours.tenant_id", "=", context.tenantId)
    .where("colours.public_id", "=", publicId)
    .where("colours.deleted_at", "is", null)
    .executeTakeFirst();
  return row ? publicRecord(row) : undefined;
}
export async function findInternalColour(
  db: Kysely<Database>,
  context: ModuleContext,
  publicId: string,
) {
  const row = await query(db)
    .where("colours.tenant_id", "=", context.tenantId)
    .where("colours.public_id", "=", publicId)
    .where("colours.deleted_at", "is", null)
    .forShare("colours")
    .executeTakeFirst();
  return row ? { ...publicRecord(row), id: row.id } : undefined;
}
async function editable(
  db: Kysely<Database>,
  context: ModuleContext,
  values: ColourValues,
) {
  return {
    name: values.name,
    active: values.active,
    sort_order: values.sortOrder,
  };
}
export async function insertColour(
  db: Kysely<Database>,
  context: ModuleContext,
  values: ColourValues,
  generate = generateColourPublicId,
) {
  for (let attempt = 0; attempt < 5; attempt++) {
    try {
      const publicId = generate();
      await db.transaction().execute(async (transaction) => {
        const data = await editable(transaction, context, values);
        await transaction
          .insertInto("colours")
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
      const saved = await findColour(db, context, publicId);
      if (!saved) throw new Error("Saved record could not be read.");
      return saved;
    } catch (error) {
      const failure = error as { code?: string; constraint?: string };
      if (
        failure.code !== "23505" ||
        failure.constraint !== "colours_public_id_unique"
      )
        throw error;
      if (attempt === 4) throw new Error("Unable to allocate a public ID.");
    }
  }
  throw new Error("Unable to allocate a public ID.");
}
export async function updateColour(
  db: Kysely<Database>,
  context: ModuleContext,
  publicId: string,
  values: ColourValues,
) {
  const changed = await db.transaction().execute(async (transaction) => {
    const existing = await transaction
      .selectFrom("colours")
      .selectAll()
      .where("tenant_id", "=", context.tenantId)
      .where("public_id", "=", publicId)
      .where("deleted_at", "is", null)
      .forUpdate()
      .executeTakeFirst();
    if (!existing) return false;
    const data = await editable(transaction, context, values);
    await transaction
      .updateTable("colours")
      .set({ ...data, updated_at: new Date(), updated_by: context.actorId })
      .where("id", "=", existing.id)
      .where("tenant_id", "=", context.tenantId)
      .execute();
    return true;
  });
  return changed ? findColour(db, context, publicId) : undefined;
}

export async function pageColourRecords(db:Kysely<Database>,context:ModuleContext,input:unknown){
 const result=await pageModuleRecords(db,query(db).where('colours.tenant_id','=',context.tenantId).where('colours.deleted_at','is',null),input,{"name":{"field":"name"},"sortOrder":{"field":"sortOrder"},"active":{"field":"active","boolean":true}});
 return result;
}
