import {pageModuleRecords} from '../../../database/page.ts';
import { randomInt } from "node:crypto";
import { sql, type Kysely } from "kysely";
import type { Database } from "../../../database/schema.ts";
import type { ModuleContext } from "../../../database/context.ts";
import { ConflictError } from "../../../http.ts";
import type { DistrictValues } from "../../../../../contracts/district.ts";
import { resolveStateReference } from "../../common/state/index.ts";

const alphabet = "abcdefghijklmnopqrstuvwxyz0123456789";
export function generateDistrictPublicId() {
  return Array.from(
    { length: 8 },
    () => alphabet[randomInt(alphabet.length)],
  ).join("");
}
function query(db: Kysely<Database>) {
  return db
    .selectFrom("districts")
    .leftJoin("states as stateIdRef", (join) =>
      join
        .onRef("stateIdRef.id", "=", "districts.state_id")
        .onRef("stateIdRef.tenant_id", "=", "districts.tenant_id"),
    )
    .select([
      "districts.id",
      "districts.public_id",
      "districts.name",
      "districts.active",
      "districts.created_at",
      "districts.updated_at",
      "districts.created_by",
      "districts.updated_by",
      "districts.sort_order as sortOrder",
      "stateIdRef.public_id as stateId",
      "stateIdRef.name as stateName",
    ] as const);
}
type Row = NonNullable<
  Awaited<ReturnType<ReturnType<typeof query>["executeTakeFirst"]>>
>;
function publicRecord(row: Row) {
  const { id, ...rest } = row;
  return {
    ...rest,
    stateId: row.stateId ?? "",
    stateName: row.stateName ?? "",
    created_at: row.created_at.toISOString(),
    updated_at: row.updated_at.toISOString(),
  };
}
export async function listDistrict(
  db: Kysely<Database>,
  context: ModuleContext,
) {
  const rows = await query(db)
    .where("districts.tenant_id", "=", context.tenantId)
    .where("districts.deleted_at", "is", null)
    .orderBy("districts.name")
    .execute();
  return rows.map(publicRecord);
}
export async function findDistrict(
  db: Kysely<Database>,
  context: ModuleContext,
  publicId: string,
) {
  const row = await query(db)
    .where("districts.tenant_id", "=", context.tenantId)
    .where("districts.public_id", "=", publicId)
    .where("districts.deleted_at", "is", null)
    .executeTakeFirst();
  return row ? publicRecord(row) : undefined;
}
export async function findInternalDistrict(
  db: Kysely<Database>,
  context: ModuleContext,
  publicId: string,
) {
  const row = await query(db)
    .where("districts.tenant_id", "=", context.tenantId)
    .where("districts.public_id", "=", publicId)
    .where("districts.deleted_at", "is", null)
    .forShare("districts")
    .executeTakeFirst();
  return row ? { ...publicRecord(row), id: row.id } : undefined;
}
async function editable(
  db: Kysely<Database>,
  context: ModuleContext,
  values: DistrictValues,
) {
  const stateId = await resolveStateReference(db, context, values.stateId);

  return {
    name: values.name,
    active: values.active,
    state_id: stateId?.id ?? null,
    sort_order: values.sortOrder,
  };
}
export async function insertDistrict(
  db: Kysely<Database>,
  context: ModuleContext,
  values: DistrictValues,
  generate = generateDistrictPublicId,
) {
  for (let attempt = 0; attempt < 5; attempt++) {
    try {
      const publicId = generate();
      await db.transaction().execute(async (transaction) => {
        const data = await editable(transaction, context, values);
        await transaction
          .insertInto("districts")
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
      const saved = await findDistrict(db, context, publicId);
      if (!saved) throw new Error("Saved record could not be read.");
      return saved;
    } catch (error) {
      const failure = error as { code?: string; constraint?: string };
      if (
        failure.code !== "23505" ||
        failure.constraint !== "districts_public_id_unique"
      )
        throw error;
      if (attempt === 4) throw new Error("Unable to allocate a public ID.");
    }
  }
  throw new Error("Unable to allocate a public ID.");
}
export async function updateDistrict(
  db: Kysely<Database>,
  context: ModuleContext,
  publicId: string,
  values: DistrictValues,
) {
  const changed = await db.transaction().execute(async (transaction) => {
    const existing = await transaction
      .selectFrom("districts")
      .selectAll()
      .where("tenant_id", "=", context.tenantId)
      .where("public_id", "=", publicId)
      .where("deleted_at", "is", null)
      .forUpdate()
      .executeTakeFirst();
    if (!existing) return false;
    const data = await editable(transaction, context, values);
    await transaction
      .updateTable("districts")
      .set({ ...data, updated_at: new Date(), updated_by: context.actorId })
      .where("id", "=", existing.id)
      .where("tenant_id", "=", context.tenantId)
      .execute();
    return true;
  });
  return changed ? findDistrict(db, context, publicId) : undefined;
}

export async function pageDistrictRecords(db:Kysely<Database>,context:ModuleContext,input:unknown){
 const result=await pageModuleRecords(db,query(db).where('districts.tenant_id','=',context.tenantId).where('districts.deleted_at','is',null),input,{"name":{"field":"name"},"stateId":{"field":"stateName","referenceField":"stateId"},"sortOrder":{"field":"sortOrder"},"active":{"field":"active","boolean":true}});
 return result;
}
