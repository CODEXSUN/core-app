import { sql, type Kysely } from 'kysely';
// Module-owned schema. Never rewrite this migration after it has been applied.
export async function up(db: Kysely<unknown>) {
  await db.schema.createTable('priorities')
    .addColumn('id', 'integer', column => column.generatedAlwaysAsIdentity().primaryKey())
    .addColumn('public_id', 'varchar(32)', column => column.notNull())
    .addColumn('tenant_id', 'varchar(128)', column => column.notNull())
    .addColumn('name', 'varchar(120)', column => column.notNull())
    .addColumn('colour', 'varchar(40)', column => column.notNull())
    .addColumn('tag', 'varchar(40)', column => column.notNull())
    .addColumn('sort_order', 'integer', column => column.notNull())
    .addColumn('active', 'boolean', column => column.notNull().defaultTo(true))
    .addColumn('created_at', 'timestamptz', column => column.notNull().defaultTo(sql`CURRENT_TIMESTAMP`))
    .addColumn('updated_at', 'timestamptz', column => column.notNull().defaultTo(sql`CURRENT_TIMESTAMP`))
    .addColumn('created_by', 'varchar(128)', column => column.notNull())
    .addColumn('updated_by', 'varchar(128)', column => column.notNull())
    .addColumn('deleted_at', 'timestamptz').addColumn('deleted_by', 'varchar(128)')
    .addUniqueConstraint('priorities_public_id_unique', ['public_id'])
    .addUniqueConstraint('priorities_tenant_identity_unique', ['tenant_id','id'])
    .addCheckConstraint('priorities_public_id_format', sql`public_id ~ '^[a-z0-9]{8}$'`)
    .addCheckConstraint('priorities_name_nonblank', sql`length(trim(name)) > 0`)
    .execute();
  await sql`create unique index priorities_name_unique on priorities (tenant_id, lower(name))`.execute(db);
}

export async function down(db: Kysely<unknown>) { await db.schema.dropTable('priorities').execute(); }
