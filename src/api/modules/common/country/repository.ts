import {pageModuleRecords} from '../../../database/page.ts';
import { randomInt } from "node:crypto";
import { sql, type Kysely } from "kysely";
import type { Database } from "../../../database/schema.ts";
import type { ModuleContext } from "../../../database/context.ts";
import { ConflictError } from "../../../http.ts";
import type { CountryValues } from "../../../../../contracts/country.ts";

const alphabet = "abcdefghijklmnopqrstuvwxyz0123456789";
export function generateCountryPublicId() {
  return Array.from(
    { length: 8 },
    () => alphabet[randomInt(alphabet.length)],
  ).join("");
}
function query(db: Kysely<Database>) {
  return db
    .selectFrom("countries")

    .select([
      "countries.id",
      "countries.public_id",
      "countries.name",
      "countries.active",
      "countries.created_at",
      "countries.updated_at",
      "countries.created_by",
      "countries.updated_by",
      "countries.code",
      "countries.sort_order as sortOrder",
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
export async function listCountry(
  db: Kysely<Database>,
  context: ModuleContext,
) {
  const rows = await query(db)
    .where("countries.tenant_id", "=", context.tenantId)
    .where("countries.deleted_at", "is", null)
    .orderBy("countries.name")
    .execute();
  return rows.map(publicRecord);
}
export async function findCountry(
  db: Kysely<Database>,
  context: ModuleContext,
  publicId: string,
) {
  const row = await query(db)
    .where("countries.tenant_id", "=", context.tenantId)
    .where("countries.public_id", "=", publicId)
    .where("countries.deleted_at", "is", null)
    .executeTakeFirst();
  return row ? publicRecord(row) : undefined;
}
export async function findInternalCountry(
  db: Kysely<Database>,
  context: ModuleContext,
  publicId: string,
) {
  const row = await query(db)
    .where("countries.tenant_id", "=", context.tenantId)
    .where("countries.public_id", "=", publicId)
    .where("countries.deleted_at", "is", null)
    .forShare("countries")
    .executeTakeFirst();
  return row ? { ...publicRecord(row), id: row.id } : undefined;
}
async function editable(
  db: Kysely<Database>,
  context: ModuleContext,
  values: CountryValues,
) {
  return {
    name: values.name,
    active: values.active,
    code: values.code,
    sort_order: values.sortOrder,
  };
}
export async function insertCountry(
  db: Kysely<Database>,
  context: ModuleContext,
  values: CountryValues,
  generate = generateCountryPublicId,
) {
  for (let attempt = 0; attempt < 5; attempt++) {
    try {
      const publicId = generate();
      await db.transaction().execute(async (transaction) => {
        const data = await editable(transaction, context, values);
        await transaction
          .insertInto("countries")
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
      const saved = await findCountry(db, context, publicId);
      if (!saved) throw new Error("Saved record could not be read.");
      return saved;
    } catch (error) {
      const failure = error as { code?: string; constraint?: string };
      if (
        failure.code !== "23505" ||
        failure.constraint !== "countries_public_id_unique"
      )
        throw error;
      if (attempt === 4) throw new Error("Unable to allocate a public ID.");
    }
  }
  throw new Error("Unable to allocate a public ID.");
}
export async function updateCountry(
  db: Kysely<Database>,
  context: ModuleContext,
  publicId: string,
  values: CountryValues,
) {
  const changed = await db.transaction().execute(async (transaction) => {
    const existing = await transaction
      .selectFrom("countries")
      .selectAll()
      .where("tenant_id", "=", context.tenantId)
      .where("public_id", "=", publicId)
      .where("deleted_at", "is", null)
      .forUpdate()
      .executeTakeFirst();
    if (!existing) return false;
    const data = await editable(transaction, context, values);
    await transaction
      .updateTable("countries")
      .set({ ...data, updated_at: new Date(), updated_by: context.actorId })
      .where("id", "=", existing.id)
      .where("tenant_id", "=", context.tenantId)
      .execute();
    return true;
  });
  return changed ? findCountry(db, context, publicId) : undefined;
}

export async function pageCountryRecords(db:Kysely<Database>,context:ModuleContext,input:unknown){
 const result=await pageModuleRecords(db,query(db).where('countries.tenant_id','=',context.tenantId).where('countries.deleted_at','is',null),input,{"name":{"field":"name"},"code":{"field":"code"},"sortOrder":{"field":"sortOrder"},"active":{"field":"active","boolean":true}});
 return result;
}
