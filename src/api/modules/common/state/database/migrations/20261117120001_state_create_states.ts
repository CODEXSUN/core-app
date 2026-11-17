import { sql, type Kysely } from 'kysely';
// Module-owned schema. Never rewrite this migration after it has been applied.
export async function up(db: Kysely<unknown>) {
  await db.schema.createTable('states')
    .addColumn('id', 'integer', column => column.generatedAlwaysAsIdentity().primaryKey())
    .addColumn('public_id', 'varchar(32)', column => column.notNull())
    .addColumn('tenant_id', 'varchar(128)', column => column.notNull())
    .addColumn('name', 'varchar(120)', column => column.notNull())
    .addColumn('country_id', 'integer')
    .addColumn('code', 'varchar(10)', column => column.notNull())
    .addColumn('sort_order', 'integer', column => column.notNull())
    .addColumn('active', 'boolean', column => column.notNull().defaultTo(true))
    .addColumn('created_at', 'timestamptz', column => column.notNull().defaultTo(sql`CURRENT_TIMESTAMP`))
    .addColumn('updated_at', 'timestamptz', column => column.notNull().defaultTo(sql`CURRENT_TIMESTAMP`))
    .addColumn('created_by', 'varchar(128)', column => column.notNull())
    .addColumn('updated_by', 'varchar(128)', column => column.notNull())
    .addColumn('deleted_at', 'timestamptz').addColumn('deleted_by', 'varchar(128)')
    .addUniqueConstraint('states_public_id_unique', ['public_id'])
    .addUniqueConstraint('states_tenant_identity_unique', ['tenant_id','id'])
    .addCheckConstraint('states_public_id_format', sql`public_id ~ '^[a-z0-9]{8}$'`)
    .addCheckConstraint('states_name_nonblank', sql`length(trim(name)) > 0`)
    .execute();
  await db.schema.alterTable('states').addForeignKeyConstraint('states_country_id_tenant_fk', ['tenant_id','country_id'], 'countries', ['tenant_id','id']).onDelete('restrict').execute();
  await db.schema.alterTable('states').addCheckConstraint('states_country_id_required', sql`country_id is not null`).execute();
  await sql`create unique index states_name_unique on states (tenant_id, country_id, lower(name))`.execute(db);
  await db.schema.createIndex('states_code_unique').on('states').columns(['tenant_id', 'country_id', 'code']).unique().execute();
}

export async function down(db: Kysely<unknown>) { await db.schema.dropTable('states').execute(); }
