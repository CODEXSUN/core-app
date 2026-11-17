import { randomInt } from "node:crypto";
import { sql, type Kysely } from "kysely";
import type { Database } from "../../../database/schema.ts";
import type { ModuleContext } from "../../../database/context.ts";
import { ConflictError } from "../../../http.ts";
import type { PincodeValues } from "../../../../../contracts/pincode.ts";
import { resolveCityReference } from "../../common/city/index.ts";

const alphabet = "abcdefghijklmnopqrstuvwxyz0123456789";
export function generatePincodePublicId() {
  return Array.from(
    { length: 8 },
    () => alphabet[randomInt(alphabet.length)],
  ).join("");
}
function query(db: Kysely<Database>) {
  return db
    .selectFrom("pincodes")
    .leftJoin("cities as cityIdRef", (join) =>
      join
        .onRef("cityIdRef.id", "=", "pincodes.city_id")
        .onRef("cityIdRef.tenant_id", "=", "pincodes.tenant_id"),
    )
    .select([
      "pincodes.id",
      "pincodes.public_id",
      "pincodes.name",
      "pincodes.active",
      "pincodes.created_at",
      "pincodes.updated_at",
      "pincodes.created_by",
      "pincodes.updated_by",
      "pincodes.area",
      "pincodes.sort_order as sortOrder",
      "cityIdRef.public_id as cityId",
      "cityIdRef.name as cityName",
    ] as const);
}
type Row = NonNullable<
  Awaited<ReturnType<ReturnType<typeof query>["executeTakeFirst"]>>
>;
function publicRecord(row: Row) {
  const { id, ...rest } = row;
  return {
    ...rest,
    cityId: row.cityId ?? "",
    cityName: row.cityName ?? "",
    created_at: row.created_at.toISOString(),
    updated_at: row.updated_at.toISOString(),
  };
}
export async function listPincode(
  db: Kysely<Database>,
  context: ModuleContext,
) {
  const rows = await query(db)
    .where("pincodes.tenant_id", "=", context.tenantId)
    .where("pincodes.deleted_at", "is", null)
    .orderBy("pincodes.name")
    .execute();
  return rows.map(publicRecord);
}
export async function findPincode(
  db: Kysely<Database>,
  context: ModuleContext,
  publicId: string,
) {
  const row = await query(db)
    .where("pincodes.tenant_id", "=", context.tenantId)
    .where("pincodes.public_id", "=", publicId)
    .where("pincodes.deleted_at", "is", null)
    .executeTakeFirst();
  return row ? publicRecord(row) : undefined;
}
export async function findInternalPincode(
  db: Kysely<Database>,
  context: ModuleContext,
  publicId: string,
) {
  const row = await query(db)
    .where("pincodes.tenant_id", "=", context.tenantId)
    .where("pincodes.public_id", "=", publicId)
    .where("pincodes.deleted_at", "is", null)
    .forShare("pincodes")
    .executeTakeFirst();
  return row ? { ...publicRecord(row), id: row.id } : undefined;
}
async function editable(
  db: Kysely<Database>,
  context: ModuleContext,
  values: PincodeValues,
) {
  const cityId = await resolveCityReference(db, context, values.cityId);

  return {
    name: values.name,
    active: values.active,
    city_id: cityId?.id ?? null,
    area: values.area,
    sort_order: values.sortOrder,
  };
}
export async function insertPincode(
  db: Kysely<Database>,
  context: ModuleContext,
  values: PincodeValues,
  generate = generatePincodePublicId,
) {
  for (let attempt = 0; attempt < 5; attempt++) {
    try {
      const publicId = generate();
      await db.transaction().execute(async (transaction) => {
        const data = await editable(transaction, context, values);
        await transaction
          .insertInto("pincodes")
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
      const saved = await findPincode(db, context, publicId);
      if (!saved) throw new Error("Saved record could not be read.");
      return saved;
    } catch (error) {
      const failure = error as { code?: string; constraint?: string };
      if (
        failure.code !== "23505" ||
        failure.constraint !== "pincodes_public_id_unique"
      )
        throw error;
      if (attempt === 4) throw new Error("Unable to allocate a public ID.");
    }
  }
  throw new Error("Unable to allocate a public ID.");
}
export async function updatePincode(
  db: Kysely<Database>,
  context: ModuleContext,
  publicId: string,
  values: PincodeValues,
) {
  const changed = await db.transaction().execute(async (transaction) => {
    const existing = await transaction
      .selectFrom("pincodes")
      .selectAll()
      .where("tenant_id", "=", context.tenantId)
      .where("public_id", "=", publicId)
      .where("deleted_at", "is", null)
      .forUpdate()
      .executeTakeFirst();
    if (!existing) return false;
    const data = await editable(transaction, context, values);
    await transaction
      .updateTable("pincodes")
      .set({ ...data, updated_at: new Date(), updated_by: context.actorId })
      .where("id", "=", existing.id)
      .where("tenant_id", "=", context.tenantId)
      .execute();
    return true;
  });
  return changed ? findPincode(db, context, publicId) : undefined;
}
