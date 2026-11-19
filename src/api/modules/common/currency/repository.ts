import {pageModuleRecords} from '../../../database/page.ts';
import { randomInt } from "node:crypto";
import { sql, type Kysely } from "kysely";
import type { Database } from "../../../database/schema.ts";
import type { ModuleContext } from "../../../database/context.ts";
import { ConflictError } from "../../../http.ts";
import type { CurrencyValues } from "../../../../../contracts/currency.ts";
export async function activeCurrencyExists(db:Kysely<Database>,context:ModuleContext){return !!await db.selectFrom('currencies').select('public_id').where('tenant_id','=',context.tenantId).where('deleted_at','is',null).where('active','=',true).limit(1).executeTakeFirst();}
export function selectBillingCurrencies(db:Kysely<Database>,context:ModuleContext,codes:string[]){
 if(!codes.length)return Promise.resolve([]);
 return db.selectFrom('currencies').select(['public_id','name','symbol','active']).where('tenant_id','=',context.tenantId).where('deleted_at','is',null).where('active','=',true).where('name','in',codes).orderBy('name').orderBy('public_id').execute();
}

const alphabet = "abcdefghijklmnopqrstuvwxyz0123456789";
export function generateCurrencyPublicId() {
  return Array.from(
    { length: 8 },
    () => alphabet[randomInt(alphabet.length)],
  ).join("");
}
function query(db: Kysely<Database>) {
  return db
    .selectFrom("currencies")

    .select([
      "currencies.id",
      "currencies.public_id",
      "currencies.name",
      "currencies.active",
      "currencies.created_at",
      "currencies.updated_at",
      "currencies.created_by",
      "currencies.updated_by",
      "currencies.symbol",
      "currencies.sort_order as sortOrder",
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
export async function listCurrency(
  db: Kysely<Database>,
  context: ModuleContext,
) {
  const rows = await query(db)
    .where("currencies.tenant_id", "=", context.tenantId)
    .where("currencies.deleted_at", "is", null)
    .orderBy("currencies.name")
    .execute();
  return rows.map(publicRecord);
}
export async function findCurrency(
  db: Kysely<Database>,
  context: ModuleContext,
  publicId: string,
) {
  const row = await query(db)
    .where("currencies.tenant_id", "=", context.tenantId)
    .where("currencies.public_id", "=", publicId)
    .where("currencies.deleted_at", "is", null)
    .executeTakeFirst();
  return row ? publicRecord(row) : undefined;
}
export async function findInternalCurrency(
  db: Kysely<Database>,
  context: ModuleContext,
  publicId: string,
) {
  const row = await query(db)
    .where("currencies.tenant_id", "=", context.tenantId)
    .where("currencies.public_id", "=", publicId)
    .where("currencies.deleted_at", "is", null)
    .forShare("currencies")
    .executeTakeFirst();
  return row ? { ...publicRecord(row), id: row.id } : undefined;
}
async function editable(
  db: Kysely<Database>,
  context: ModuleContext,
  values: CurrencyValues,
) {
  return {
    name: values.name,
    active: values.active,
    symbol: values.symbol,
    sort_order: values.sortOrder,
  };
}
export async function insertCurrency(
  db: Kysely<Database>,
  context: ModuleContext,
  values: CurrencyValues,
  generate = generateCurrencyPublicId,
) {
  for (let attempt = 0; attempt < 5; attempt++) {
    try {
      const publicId = generate();
      await db.transaction().execute(async (transaction) => {
        const data = await editable(transaction, context, values);
        await transaction
          .insertInto("currencies")
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
      const saved = await findCurrency(db, context, publicId);
      if (!saved) throw new Error("Saved record could not be read.");
      return saved;
    } catch (error) {
      const failure = error as { code?: string; constraint?: string };
      if (
        failure.code !== "23505" ||
        failure.constraint !== "currencies_public_id_unique"
      )
        throw error;
      if (attempt === 4) throw new Error("Unable to allocate a public ID.");
    }
  }
  throw new Error("Unable to allocate a public ID.");
}
export async function updateCurrency(
  db: Kysely<Database>,
  context: ModuleContext,
  publicId: string,
  values: CurrencyValues,
) {
  const changed = await db.transaction().execute(async (transaction) => {
    const existing = await transaction
      .selectFrom("currencies")
      .selectAll()
      .where("tenant_id", "=", context.tenantId)
      .where("public_id", "=", publicId)
      .where("deleted_at", "is", null)
      .forUpdate()
      .executeTakeFirst();
    if (!existing) return false;
    const data = await editable(transaction, context, values);
    await transaction
      .updateTable("currencies")
      .set({ ...data, updated_at: new Date(), updated_by: context.actorId })
      .where("id", "=", existing.id)
      .where("tenant_id", "=", context.tenantId)
      .execute();
    return true;
  });
  return changed ? findCurrency(db, context, publicId) : undefined;
}

export async function pageCurrencyRecords(db:Kysely<Database>,context:ModuleContext,input:unknown){
 const result=await pageModuleRecords(db,query(db).where('currencies.tenant_id','=',context.tenantId).where('currencies.deleted_at','is',null),input,{"name":{"field":"name"},"symbol":{"field":"symbol"},"sortOrder":{"field":"sortOrder"},"active":{"field":"active","boolean":true}});
 return result;
}
