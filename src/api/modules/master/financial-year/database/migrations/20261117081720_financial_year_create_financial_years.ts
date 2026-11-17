import { sql, type Kysely } from 'kysely';

// Immutable module-owned schema. Add a new migration for subsequent changes.
export async function up(db: Kysely<unknown>) {
  await db.schema.createTable('financial_years')
    .addColumn('id', 'integer', column => column.generatedAlwaysAsIdentity().primaryKey())
    .addColumn('public_id', 'varchar(32)', column => column.notNull())
    .addColumn('tenant_id', 'varchar(128)', column => column.notNull())
    .addColumn('name', 'varchar(120)', column => column.notNull())
    .addColumn('start_date', 'date', column => column.notNull())
    .addColumn('end_date', 'date', column => column.notNull())
    .addColumn('is_current', 'boolean', column => column.notNull())
    .addColumn('active', 'boolean', column => column.notNull().defaultTo(true))
    .addColumn('created_at', 'timestamptz', column => column.notNull().defaultTo(sql`CURRENT_TIMESTAMP`))
    .addColumn('updated_at', 'timestamptz', column => column.notNull().defaultTo(sql`CURRENT_TIMESTAMP`))
    .addColumn('created_by', 'varchar(128)', column => column.notNull())
    .addColumn('updated_by', 'varchar(128)', column => column.notNull())
    .addColumn('deleted_at', 'timestamptz')
    .addColumn('deleted_by', 'varchar(128)')
    .addUniqueConstraint('financial_years_public_id_unique', ['public_id'])
    .addCheckConstraint('financial_years_name_nonblank', sql`length(trim(name)) > 0`)
    .execute();
  await db.schema.createIndex('financial_years_tenant_idx').on('financial_years').column('tenant_id').execute();
  await db.schema.alterTable('financial_years').addCheckConstraint('financial_years_dates', sql`end_date > start_date`).execute();
  await db.schema.alterTable('financial_years').addCheckConstraint('financial_years_current_active', sql`not is_current or active`).execute();
  await sql`create unique index financial_years_current_unique on financial_years (tenant_id) where is_current and deleted_at is null`.execute(db);
  await sql`create unique index financial_years_name_unique on financial_years (tenant_id, lower(name))`.execute(db);
  await sql`create unique index financial_years_range_unique on financial_years (tenant_id, start_date, end_date)`.execute(db);
  await db.schema.alterTable('financial_years').addCheckConstraint('financial_years_public_id_format', sql`public_id ~ '^[a-z0-9]{8}$'`).execute();
}

// Explicit rollback drops this module's data; use only in authorized recovery/tests.
export async function down(db: Kysely<unknown>) {
  await db.schema.dropTable('financial_years').execute();
}
