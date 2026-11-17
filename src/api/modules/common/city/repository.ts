import { randomInt } from "node:crypto";
import { sql, type Kysely } from "kysely";
import type { Database } from "../../../database/schema.ts";
import type { ModuleContext } from "../../../database/context.ts";
import { ConflictError } from "../../../http.ts";
import type { CityValues } from "../../../../../contracts/city.ts";
import { resolveDistrictReference } from "../../common/district/index.ts";

const alphabet = "abcdefghijklmnopqrstuvwxyz0123456789";
export function generateCityPublicId() {
  return Array.from(
    { length: 8 },
    () => alphabet[randomInt(alphabet.length)],
  ).join("");
}
function query(db: Kysely<Database>) {
  return db
    .selectFrom("cities")
    .leftJoin("districts as districtIdRef", (join) =>
      join
        .onRef("districtIdRef.id", "=", "cities.district_id")
        .onRef("districtIdRef.tenant_id", "=", "cities.tenant_id"),
    )
    .select([
      "cities.id",
      "cities.public_id",
      "cities.name",
      "cities.active",
      "cities.created_at",
      "cities.updated_at",
      "cities.created_by",
      "cities.updated_by",
      "cities.sort_order as sortOrder",
      "districtIdRef.public_id as districtId",
      "districtIdRef.name as districtName",
    ] as const);
}
type Row = NonNullable<
  Awaited<ReturnType<ReturnType<typeof query>["executeTakeFirst"]>>
>;
function publicRecord(row: Row) {
  const { id, ...rest } = row;
  return {
    ...rest,
    districtId: row.districtId ?? "",
    districtName: row.districtName ?? "",
    created_at: row.created_at.toISOString(),
    updated_at: row.updated_at.toISOString(),
  };
}
export async function listCity(db: Kysely<Database>, context: ModuleContext) {
  const rows = await query(db)
    .where("cities.tenant_id", "=", context.tenantId)
    .where("cities.deleted_at", "is", null)
    .orderBy("cities.name")
    .execute();
  return rows.map(publicRecord);
}
export async function findCity(
  db: Kysely<Database>,
  context: ModuleContext,
  publicId: string,
) {
  const row = await query(db)
    .where("cities.tenant_id", "=", context.tenantId)
    .where("cities.public_id", "=", publicId)
    .where("cities.deleted_at", "is", null)
    .executeTakeFirst();
  return row ? publicRecord(row) : undefined;
}
export async function findInternalCity(
  db: Kysely<Database>,
  context: ModuleContext,
  publicId: string,
) {
  const row = await query(db)
    .where("cities.tenant_id", "=", context.tenantId)
    .where("cities.public_id", "=", publicId)
    .where("cities.deleted_at", "is", null)
    .forShare("cities")
    .executeTakeFirst();
  return row ? { ...publicRecord(row), id: row.id } : undefined;
}
async function editable(
  db: Kysely<Database>,
  context: ModuleContext,
  values: CityValues,
) {
  const districtId = await resolveDistrictReference(
    db,
    context,
    values.districtId,
  );

  return {
    name: values.name,
    active: values.active,
    district_id: districtId?.id ?? null,
    sort_order: values.sortOrder,
  };
}
export async function insertCity(
  db: Kysely<Database>,
  context: ModuleContext,
  values: CityValues,
  generate = generateCityPublicId,
) {
  for (let attempt = 0; attempt < 5; attempt++) {
    try {
      const publicId = generate();
      await db.transaction().execute(async (transaction) => {
        const data = await editable(transaction, context, values);
        await transaction
          .insertInto("cities")
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
      const saved = await findCity(db, context, publicId);
      if (!saved) throw new Error("Saved record could not be read.");
      return saved;
    } catch (error) {
      const failure = error as { code?: string; constraint?: string };
      if (
        failure.code !== "23505" ||
        failure.constraint !== "cities_public_id_unique"
      )
        throw error;
      if (attempt === 4) throw new Error("Unable to allocate a public ID.");
    }
  }
  throw new Error("Unable to allocate a public ID.");
}
export async function updateCity(
  db: Kysely<Database>,
  context: ModuleContext,
  publicId: string,
  values: CityValues,
) {
  const changed = await db.transaction().execute(async (transaction) => {
    const existing = await transaction
      .selectFrom("cities")
      .selectAll()
      .where("tenant_id", "=", context.tenantId)
      .where("public_id", "=", publicId)
      .where("deleted_at", "is", null)
      .forUpdate()
      .executeTakeFirst();
    if (!existing) return false;
    const data = await editable(transaction, context, values);
    await transaction
      .updateTable("cities")
      .set({ ...data, updated_at: new Date(), updated_by: context.actorId })
      .where("id", "=", existing.id)
      .where("tenant_id", "=", context.tenantId)
      .execute();
    return true;
  });
  return changed ? findCity(db, context, publicId) : undefined;
}
