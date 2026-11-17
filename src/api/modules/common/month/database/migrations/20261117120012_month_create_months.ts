import { sql, type Kysely } from 'kysely';
// Module-owned schema. Never rewrite this migration after it has been applied.
export async function up(db: Kysely<unknown>) {
  await db.schema.createTable('months')
    .addColumn('id', 'integer', column => column.generatedAlwaysAsIdentity().primaryKey())
    .addColumn('public_id', 'varchar(32)', column => column.notNull())
    .addColumn('tenant_id', 'varchar(128)', column => column.notNull())
    .addColumn('name', 'varchar(120)', column => column.notNull())
    .addColumn('start_date', 'date', column => column.notNull())
    .addColumn('end_date', 'date', column => column.notNull())
    .addColumn('sort_order', 'integer', column => column.notNull())
    .addColumn('active', 'boolean', column => column.notNull().defaultTo(true))
    .addColumn('created_at', 'timestamptz', column => column.notNull().defaultTo(sql`CURRENT_TIMESTAMP`))
    .addColumn('updated_at', 'timestamptz', column => column.notNull().defaultTo(sql`CURRENT_TIMESTAMP`))
    .addColumn('created_by', 'varchar(128)', column => column.notNull())
    .addColumn('updated_by', 'varchar(128)', column => column.notNull())
    .addColumn('deleted_at', 'timestamptz').addColumn('deleted_by', 'varchar(128)')
    .addUniqueConstraint('months_public_id_unique', ['public_id'])
    .addUniqueConstraint('months_tenant_identity_unique', ['tenant_id','id'])
    .addCheckConstraint('months_public_id_format', sql`public_id ~ '^[a-z0-9]{8}$'`)
    .addCheckConstraint('months_name_nonblank', sql`length(trim(name)) > 0`)
    .execute();
  await sql`create unique index months_name_unique on months (tenant_id, lower(name))`.execute(db);
  await db.schema.alterTable('months').addCheckConstraint('months_date_range', sql`end_date >= start_date`).execute();
}

export async function down(db: Kysely<unknown>) { await db.schema.dropTable('months').execute(); }
