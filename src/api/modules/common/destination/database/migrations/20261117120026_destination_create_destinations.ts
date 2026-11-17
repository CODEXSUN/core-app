import { sql, type Kysely } from 'kysely';
// Module-owned schema. Never rewrite this migration after it has been applied.
export async function up(db: Kysely<unknown>) {
  await db.schema.createTable('destinations')
    .addColumn('id', 'integer', column => column.generatedAlwaysAsIdentity().primaryKey())
    .addColumn('public_id', 'varchar(32)', column => column.notNull())
    .addColumn('tenant_id', 'varchar(128)', column => column.notNull())
    .addColumn('name', 'varchar(120)', column => column.notNull())
    .addColumn('sort_order', 'integer', column => column.notNull())
    .addColumn('active', 'boolean', column => column.notNull().defaultTo(true))
    .addColumn('created_at', 'timestamptz', column => column.notNull().defaultTo(sql`CURRENT_TIMESTAMP`))
    .addColumn('updated_at', 'timestamptz', column => column.notNull().defaultTo(sql`CURRENT_TIMESTAMP`))
    .addColumn('created_by', 'varchar(128)', column => column.notNull())
    .addColumn('updated_by', 'varchar(128)', column => column.notNull())
    .addColumn('deleted_at', 'timestamptz').addColumn('deleted_by', 'varchar(128)')
    .addUniqueConstraint('destinations_public_id_unique', ['public_id'])
    .addUniqueConstraint('destinations_tenant_identity_unique', ['tenant_id','id'])
    .addCheckConstraint('destinations_public_id_format', sql`public_id ~ '^[a-z0-9]{8}$'`)
    .addCheckConstraint('destinations_name_nonblank', sql`length(trim(name)) > 0`)
    .execute();
  await sql`create unique index destinations_name_unique on destinations (tenant_id, lower(name))`.execute(db);
}

export async function down(db: Kysely<unknown>) { await db.schema.dropTable('destinations').execute(); }
