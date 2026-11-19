import {pageModuleRecords} from '../../../database/page.ts';
import { randomInt } from "node:crypto";
import { sql, type Kysely } from "kysely";
import type { Database } from "../../../database/schema.ts";
import type { ModuleContext } from "../../../database/context.ts";
import { ConflictError } from "../../../http.ts";
import type { TransportValues } from "../../../../../contracts/transport.ts";

const alphabet = "abcdefghijklmnopqrstuvwxyz0123456789";
export function generateTransportPublicId() {
  return Array.from(
    { length: 8 },
    () => alphabet[randomInt(alphabet.length)],
  ).join("");
}
function query(db: Kysely<Database>) {
  return db
    .selectFrom("transports")

    .select([
      "transports.id",
      "transports.public_id",
      "transports.name",
      "transports.active",
      "transports.created_at",
      "transports.updated_at",
      "transports.created_by",
      "transports.updated_by",
      "transports.gst",
      "transports.vehicle_no as vehicleNo",
      "transports.address",
      "transports.contact_no as contactNo",
      "transports.contact_person as contactPerson",
      "transports.sort_order as sortOrder",
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
export async function listTransport(
  db: Kysely<Database>,
  context: ModuleContext,
) {
  const rows = await query(db)
    .where("transports.tenant_id", "=", context.tenantId)
    .where("transports.deleted_at", "is", null)
    .orderBy("transports.name")
    .execute();
  return rows.map(publicRecord);
}
export async function findTransport(
  db: Kysely<Database>,
  context: ModuleContext,
  publicId: string,
) {
  const row = await query(db)
    .where("transports.tenant_id", "=", context.tenantId)
    .where("transports.public_id", "=", publicId)
    .where("transports.deleted_at", "is", null)
    .executeTakeFirst();
  return row ? publicRecord(row) : undefined;
}
export async function findInternalTransport(
  db: Kysely<Database>,
  context: ModuleContext,
  publicId: string,
) {
  const row = await query(db)
    .where("transports.tenant_id", "=", context.tenantId)
    .where("transports.public_id", "=", publicId)
    .where("transports.deleted_at", "is", null)
    .forShare("transports")
    .executeTakeFirst();
  return row ? { ...publicRecord(row), id: row.id } : undefined;
}
async function editable(
  db: Kysely<Database>,
  context: ModuleContext,
  values: TransportValues,
) {
  return {
    name: values.name,
    active: values.active,
    gst: values.gst,
    vehicle_no: values.vehicleNo,
    address: values.address,
    contact_no: values.contactNo,
    contact_person: values.contactPerson,
    sort_order: values.sortOrder,
  };
}
export async function insertTransport(
  db: Kysely<Database>,
  context: ModuleContext,
  values: TransportValues,
  generate = generateTransportPublicId,
) {
  for (let attempt = 0; attempt < 5; attempt++) {
    try {
      const publicId = generate();
      await db.transaction().execute(async (transaction) => {
        const data = await editable(transaction, context, values);
        await transaction
          .insertInto("transports")
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
      const saved = await findTransport(db, context, publicId);
      if (!saved) throw new Error("Saved record could not be read.");
      return saved;
    } catch (error) {
      const failure = error as { code?: string; constraint?: string };
      if (
        failure.code !== "23505" ||
        failure.constraint !== "transports_public_id_unique"
      )
        throw error;
      if (attempt === 4) throw new Error("Unable to allocate a public ID.");
    }
  }
  throw new Error("Unable to allocate a public ID.");
}
export async function updateTransport(
  db: Kysely<Database>,
  context: ModuleContext,
  publicId: string,
  values: TransportValues,
) {
  const changed = await db.transaction().execute(async (transaction) => {
    const existing = await transaction
      .selectFrom("transports")
      .selectAll()
      .where("tenant_id", "=", context.tenantId)
      .where("public_id", "=", publicId)
      .where("deleted_at", "is", null)
      .forUpdate()
      .executeTakeFirst();
    if (!existing) return false;
    const data = await editable(transaction, context, values);
    await transaction
      .updateTable("transports")
      .set({ ...data, updated_at: new Date(), updated_by: context.actorId })
      .where("id", "=", existing.id)
      .where("tenant_id", "=", context.tenantId)
      .execute();
    return true;
  });
  return changed ? findTransport(db, context, publicId) : undefined;
}

export async function pageTransportRecords(db:Kysely<Database>,context:ModuleContext,input:unknown){
 const result=await pageModuleRecords(db,query(db).where('transports.tenant_id','=',context.tenantId).where('transports.deleted_at','is',null),input,{"name":{"field":"name"},"gst":{"field":"gst"},"vehicleNo":{"field":"vehicleNo"},"address":{"field":"address"},"contactNo":{"field":"contactNo"},"active":{"field":"active","boolean":true}});
 return result;
}
