import { sql, type Kysely } from 'kysely';

// Immutable module-owned schema. Add a new migration for subsequent changes.
export async function up(db: Kysely<unknown>) {
  await db.schema.createTable('contacts')
    .addColumn('id', 'integer', column => column.generatedAlwaysAsIdentity().primaryKey())
    .addColumn('public_id', 'varchar(32)', column => column.notNull())
    .addColumn('tenant_id', 'varchar(128)', column => column.notNull())
    .addColumn('name', 'varchar(120)', column => column.notNull())
    .addColumn('code', 'varchar(40)', column => column.notNull())
    .addColumn('legal_name', 'varchar(200)', column => column.notNull())
    .addColumn('role', 'varchar(16)', column => column.notNull())
    .addColumn('gstin', 'varchar(20)', column => column.notNull())
    .addColumn('pan', 'varchar(20)', column => column.notNull())
    .addColumn('website', 'varchar(300)', column => column.notNull())
    .addColumn('description', 'text', column => column.notNull())
    .addColumn('emails', 'jsonb', column => column.notNull())
    .addColumn('phones', 'jsonb', column => column.notNull())
    .addColumn('addresses', 'jsonb', column => column.notNull())
    .addColumn('active', 'boolean', column => column.notNull().defaultTo(true))
    .addColumn('created_at', 'timestamptz', column => column.notNull().defaultTo(sql`CURRENT_TIMESTAMP`))
    .addColumn('updated_at', 'timestamptz', column => column.notNull().defaultTo(sql`CURRENT_TIMESTAMP`))
    .addColumn('created_by', 'varchar(128)', column => column.notNull())
    .addColumn('updated_by', 'varchar(128)', column => column.notNull())
    .addColumn('deleted_at', 'timestamptz')
    .addColumn('deleted_by', 'varchar(128)')
    .addUniqueConstraint('contacts_public_id_unique', ['public_id'])
    .addCheckConstraint('contacts_name_nonblank', sql`length(trim(name)) > 0`)
    .execute();
  await db.schema.alterTable('contacts').addCheckConstraint('contacts_role', sql`role in ('customer', 'supplier', 'both', 'other')`).execute();
  await db.schema.createIndex('contacts_tenant_idx').on('contacts').column('tenant_id').execute();
  await db.schema.createIndex('contacts_code_unique').on('contacts').columns(['tenant_id', 'code']).unique().execute();
  await db.schema.alterTable('contacts').addCheckConstraint('contacts_public_id_format', sql`public_id ~ '^[a-z0-9]{8}$'`).execute();
}

// Explicit rollback drops this module's data; use only in authorized recovery/tests.
export async function down(db: Kysely<unknown>) {
  await db.schema.dropTable('contacts').execute();
}
