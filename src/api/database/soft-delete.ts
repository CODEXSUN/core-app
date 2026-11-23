import { sql, type Kysely } from "kysely";
import type { Database } from "./schema.ts";
import type { ModuleContext } from "./context.ts";
import { ConflictError } from "../http.ts";
import { assertPartyMasterNotReferenced } from "../party-references.ts";

/** Core-owned soft deletion. Inbound Core foreign keys remain intact. */
export async function softDeleteCoreRecord(
  db: Kysely<Database>,
  context: ModuleContext,
  table: keyof Database,
  publicId: string,
) {
  return db.transaction().execute(async (transaction) => {
    const record = await sql<{
      id: number;
    }>`SELECT id FROM ${sql.table(table)} WHERE public_id=${publicId} AND tenant_id=${context.tenantId} AND deleted_at IS NULL FOR UPDATE`.execute(
      transaction,
    );
    if (!record.rows[0]) return undefined;
    const id = record.rows[0].id;
    await assertPartyMasterNotReferenced(transaction, context, table, publicId);
    const references = await sql<{
      schema: string;
      table: string;
      column: string;
      scoped: boolean;
      soft: boolean;
    }>`
      SELECT child_ns.nspname AS schema, child.relname AS table, child_column.attname AS column,
        EXISTS(SELECT 1 FROM pg_attribute WHERE attrelid=child.oid AND attname='tenant_id' AND NOT attisdropped) AS scoped,
        EXISTS(SELECT 1 FROM pg_attribute WHERE attrelid=child.oid AND attname='deleted_at' AND NOT attisdropped) AS soft
      FROM pg_constraint constraint_row
      JOIN pg_class parent ON parent.oid=constraint_row.confrelid
      JOIN pg_namespace parent_ns ON parent_ns.oid=parent.relnamespace
      JOIN pg_class child ON child.oid=constraint_row.conrelid
      JOIN pg_namespace child_ns ON child_ns.oid=child.relnamespace
      CROSS JOIN LATERAL unnest(constraint_row.conkey,constraint_row.confkey) AS keys(child_key,parent_key)
      JOIN pg_attribute child_column ON child_column.attrelid=child.oid AND child_column.attnum=keys.child_key
      JOIN pg_attribute parent_column ON parent_column.attrelid=parent.oid AND parent_column.attnum=keys.parent_key
      WHERE constraint_row.contype='f' AND parent_ns.nspname=current_schema()
        AND parent.relname=${table} AND parent_column.attname='id'
    `.execute(transaction);
    for (const reference of references.rows) {
      const child = sql.id(reference.schema, reference.table);
      const found =
        await sql`SELECT 1 FROM ${child} WHERE ${sql.id(reference.column)}=${id}
        ${reference.scoped ? sql`AND tenant_id=${context.tenantId}` : sql``}
        ${reference.soft ? sql`AND deleted_at IS NULL` : sql``} LIMIT 1`.execute(
          transaction,
        );
      if (found.rows.length)
        throw new ConflictError(
          "This record is referenced by another Core record. Change or delete that reference first.",
        );
    }
    const result = await sql<{
      public_id: string;
      deleted_at: Date;
      deleted_by: string;
      active: boolean;
    }>`
      UPDATE ${sql.table(table)} SET active=false,
      ${table === "financial_years" ? sql`is_current=false,` : sql``}
      deleted_at=CURRENT_TIMESTAMP,deleted_by=${context.actorId},updated_at=CURRENT_TIMESTAMP,updated_by=${context.actorId}
      WHERE id=${id} AND tenant_id=${context.tenantId} AND deleted_at IS NULL
      RETURNING public_id,deleted_at,deleted_by,active
    `.execute(transaction);
    const deleted = result.rows[0];
    return { ...deleted, deleted_at: deleted.deleted_at.toISOString() };
  });
}
