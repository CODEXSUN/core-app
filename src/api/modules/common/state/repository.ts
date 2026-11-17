import { randomInt } from "node:crypto";
import { sql, type Kysely } from "kysely";
import type { Database } from "../../../database/schema.ts";
import type { ModuleContext } from "../../../database/context.ts";
import { ConflictError } from "../../../http.ts";
import type { StateValues } from "../../../../../contracts/state.ts";
import { resolveCountryReference } from "../../common/country/index.ts";

const alphabet = "abcdefghijklmnopqrstuvwxyz0123456789";
export function generateStatePublicId() {
  return Array.from(
    { length: 8 },
    () => alphabet[randomInt(alphabet.length)],
  ).join("");
}
function query(db: Kysely<Database>) {
  return db
    .selectFrom("states")
    .leftJoin("countries as countryIdRef", (join) =>
      join
        .onRef("countryIdRef.id", "=", "states.country_id")
        .onRef("countryIdRef.tenant_id", "=", "states.tenant_id"),
    )
    .select([
      "states.id",
      "states.public_id",
      "states.name",
      "states.active",
      "states.created_at",
      "states.updated_at",
      "states.created_by",
      "states.updated_by",
      "states.code",
      "states.sort_order as sortOrder",
      "countryIdRef.public_id as countryId",
      "countryIdRef.name as countryName",
    ] as const);
}
type Row = NonNullable<
  Awaited<ReturnType<ReturnType<typeof query>["executeTakeFirst"]>>
>;
function publicRecord(row: Row) {
  const { id, ...rest } = row;
  return {
    ...rest,
    countryId: row.countryId ?? "",
    countryName: row.countryName ?? "",
    created_at: row.created_at.toISOString(),
    updated_at: row.updated_at.toISOString(),
  };
}
export async function listState(db: Kysely<Database>, context: ModuleContext) {
  const rows = await query(db)
    .where("states.tenant_id", "=", context.tenantId)
    .where("states.deleted_at", "is", null)
    .orderBy("states.name")
    .execute();
  return rows.map(publicRecord);
}
export async function findState(
  db: Kysely<Database>,
  context: ModuleContext,
  publicId: string,
) {
  const row = await query(db)
    .where("states.tenant_id", "=", context.tenantId)
    .where("states.public_id", "=", publicId)
    .where("states.deleted_at", "is", null)
    .executeTakeFirst();
  return row ? publicRecord(row) : undefined;
}
export async function findInternalState(
  db: Kysely<Database>,
  context: ModuleContext,
  publicId: string,
) {
  const row = await query(db)
    .where("states.tenant_id", "=", context.tenantId)
    .where("states.public_id", "=", publicId)
    .where("states.deleted_at", "is", null)
    .forShare("states")
    .executeTakeFirst();
  return row ? { ...publicRecord(row), id: row.id } : undefined;
}
async function editable(
  db: Kysely<Database>,
  context: ModuleContext,
  values: StateValues,
) {
  const countryId = await resolveCountryReference(
    db,
    context,
    values.countryId,
  );

  return {
    name: values.name,
    active: values.active,
    country_id: countryId?.id ?? null,
    code: values.code,
    sort_order: values.sortOrder,
  };
}
export async function insertState(
  db: Kysely<Database>,
  context: ModuleContext,
  values: StateValues,
  generate = generateStatePublicId,
) {
  for (let attempt = 0; attempt < 5; attempt++) {
    try {
      const publicId = generate();
      await db.transaction().execute(async (transaction) => {
        const data = await editable(transaction, context, values);
        await transaction
          .insertInto("states")
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
      const saved = await findState(db, context, publicId);
      if (!saved) throw new Error("Saved record could not be read.");
      return saved;
    } catch (error) {
      const failure = error as { code?: string; constraint?: string };
      if (
        failure.code !== "23505" ||
        failure.constraint !== "states_public_id_unique"
      )
        throw error;
      if (attempt === 4) throw new Error("Unable to allocate a public ID.");
    }
  }
  throw new Error("Unable to allocate a public ID.");
}
export async function updateState(
  db: Kysely<Database>,
  context: ModuleContext,
  publicId: string,
  values: StateValues,
) {
  const changed = await db.transaction().execute(async (transaction) => {
    const existing = await transaction
      .selectFrom("states")
      .selectAll()
      .where("tenant_id", "=", context.tenantId)
      .where("public_id", "=", publicId)
      .where("deleted_at", "is", null)
      .forUpdate()
      .executeTakeFirst();
    if (!existing) return false;
    const data = await editable(transaction, context, values);
    await transaction
      .updateTable("states")
      .set({ ...data, updated_at: new Date(), updated_by: context.actorId })
      .where("id", "=", existing.id)
      .where("tenant_id", "=", context.tenantId)
      .execute();
    return true;
  });
  return changed ? findState(db, context, publicId) : undefined;
}
