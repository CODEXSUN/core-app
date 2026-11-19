import { randomInt } from "node:crypto";
import { sql, type Kysely } from "kysely";
import type { Database } from "../../../database/schema.ts";
import type { ModuleContext } from "../../../database/context.ts";
import { ConflictError } from "../../../http.ts";
import type { UnitValues } from "../../../../../contracts/unit.ts";

const alphabet = "abcdefghijklmnopqrstuvwxyz0123456789";
export async function activeUnitExists(db:Kysely<Database>,context:ModuleContext){return !!await db.selectFrom('units').select('public_id').where('tenant_id','=',context.tenantId).where('deleted_at','is',null).where('active','=',true).limit(1).executeTakeFirst();}
export function generateUnitPublicId() {
  return Array.from(
    { length: 8 },
    () => alphabet[randomInt(alphabet.length)],
  ).join("");
}
function query(db: Kysely<Database>) {
  return db
    .selectFrom("units")

    .select([
      "units.id",
      "units.public_id",
      "units.name",
      "units.active",
      "units.created_at",
      "units.updated_at",
      "units.created_by",
      "units.updated_by",
      "units.sort_order as sortOrder",
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
export async function listUnit(db: Kysely<Database>, context: ModuleContext) {
  const rows = await query(db)
    .where("units.tenant_id", "=", context.tenantId)
    .where("units.deleted_at", "is", null)
    .orderBy("units.name")
    .execute();
  return rows.map(publicRecord);
}
export async function findUnit(
  db: Kysely<Database>,
  context: ModuleContext,
  publicId: string,
) {
  const row = await query(db)
    .where("units.tenant_id", "=", context.tenantId)
    .where("units.public_id", "=", publicId)
    .where("units.deleted_at", "is", null)
    .executeTakeFirst();
  return row ? publicRecord(row) : undefined;
}
export async function findInternalUnit(
  db: Kysely<Database>,
  context: ModuleContext,
  publicId: string,
) {
  const row = await query(db)
    .where("units.tenant_id", "=", context.tenantId)
    .where("units.public_id", "=", publicId)
    .where("units.deleted_at", "is", null)
    .forShare("units")
    .executeTakeFirst();
  return row ? { ...publicRecord(row), id: row.id } : undefined;
}
async function editable(
  db: Kysely<Database>,
  context: ModuleContext,
  values: UnitValues,
) {
  return {
    name: values.name,
    active: values.active,
    sort_order: values.sortOrder,
  };
}
export async function insertUnit(
  db: Kysely<Database>,
  context: ModuleContext,
  values: UnitValues,
  generate = generateUnitPublicId,
) {
  for (let attempt = 0; attempt < 5; attempt++) {
    try {
      const publicId = generate();
      await db.transaction().execute(async (transaction) => {
        const data = await editable(transaction, context, values);
        await transaction
          .insertInto("units")
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
      const saved = await findUnit(db, context, publicId);
      if (!saved) throw new Error("Saved record could not be read.");
      return saved;
    } catch (error) {
      const failure = error as { code?: string; constraint?: string };
      if (
        failure.code !== "23505" ||
        failure.constraint !== "units_public_id_unique"
      )
        throw error;
      if (attempt === 4) throw new Error("Unable to allocate a public ID.");
    }
  }
  throw new Error("Unable to allocate a public ID.");
}
export async function updateUnit(
  db: Kysely<Database>,
  context: ModuleContext,
  publicId: string,
  values: UnitValues,
) {
  const changed = await db.transaction().execute(async (transaction) => {
    const existing = await transaction
      .selectFrom("units")
      .selectAll()
      .where("tenant_id", "=", context.tenantId)
      .where("public_id", "=", publicId)
      .where("deleted_at", "is", null)
      .forUpdate()
      .executeTakeFirst();
    if (!existing) return false;
    if (existing.name.trim() === "-")
      throw new ConflictError("The default hyphen unit cannot be modified.");
    const data = await editable(transaction, context, values);
    await transaction
      .updateTable("units")
      .set({ ...data, updated_at: new Date(), updated_by: context.actorId })
      .where("id", "=", existing.id)
      .where("tenant_id", "=", context.tenantId)
      .execute();
    return true;
  });
  return changed ? findUnit(db, context, publicId) : undefined;
}
