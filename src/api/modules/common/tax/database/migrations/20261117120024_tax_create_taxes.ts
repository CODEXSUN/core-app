import { sql, type Kysely } from 'kysely';
// Module-owned schema. Never rewrite this migration after it has been applied.
export async function up(db: Kysely<unknown>) {
  await db.schema.createTable('taxes')
    .addColumn('id', 'integer', column => column.generatedAlwaysAsIdentity().primaryKey())
    .addColumn('public_id', 'varchar(32)', column => column.notNull())
    .addColumn('tenant_id', 'varchar(128)', column => column.notNull())
    .addColumn('name', 'varchar(120)', column => column.notNull())
    .addColumn('rate_percent', sql`numeric(18,4)`, column => column.notNull())
    .addColumn('description', 'text', column => column.notNull())
    .addColumn('sort_order', 'integer', column => column.notNull())
    .addColumn('active', 'boolean', column => column.notNull().defaultTo(true))
    .addColumn('created_at', 'timestamptz', column => column.notNull().defaultTo(sql`CURRENT_TIMESTAMP`))
    .addColumn('updated_at', 'timestamptz', column => column.notNull().defaultTo(sql`CURRENT_TIMESTAMP`))
    .addColumn('created_by', 'varchar(128)', column => column.notNull())
    .addColumn('updated_by', 'varchar(128)', column => column.notNull())
    .addColumn('deleted_at', 'timestamptz').addColumn('deleted_by', 'varchar(128)')
    .addUniqueConstraint('taxes_public_id_unique', ['public_id'])
    .addUniqueConstraint('taxes_tenant_identity_unique', ['tenant_id','id'])
    .addCheckConstraint('taxes_public_id_format', sql`public_id ~ '^[a-z0-9]{8}$'`)
    .addCheckConstraint('taxes_name_nonblank', sql`length(trim(name)) > 0`)
    .execute();
  await sql`create unique index taxes_name_unique on taxes (tenant_id, lower(name))`.execute(db);
  await db.schema.createIndex('taxes_rate_unique').on('taxes').columns(['tenant_id','rate_percent']).unique().execute();
  await db.schema.alterTable('taxes').addCheckConstraint('taxes_rate_range', sql`rate_percent >= 0 and rate_percent <= 100`).execute();
}

export async function down(db: Kysely<unknown>) { await db.schema.dropTable('taxes').execute(); }
