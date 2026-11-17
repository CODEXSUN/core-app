import { sql, type Kysely } from 'kysely';
// Module-owned schema. Never rewrite this migration after it has been applied.
export async function up(db: Kysely<unknown>) {
  await db.schema.createTable('default_companies')
    .addColumn('id', 'integer', column => column.generatedAlwaysAsIdentity().primaryKey())
    .addColumn('public_id', 'varchar(32)', column => column.notNull())
    .addColumn('tenant_id', 'varchar(128)', column => column.notNull())
    .addColumn('name', 'varchar(120)', column => column.notNull())
    .addColumn('company_id', 'integer')
    .addColumn('financial_year_id', 'integer')
    .addColumn('landing_app', 'varchar(300)', column => column.notNull())
    .addColumn('active', 'boolean', column => column.notNull().defaultTo(true))
    .addColumn('created_at', 'timestamptz', column => column.notNull().defaultTo(sql`CURRENT_TIMESTAMP`))
    .addColumn('updated_at', 'timestamptz', column => column.notNull().defaultTo(sql`CURRENT_TIMESTAMP`))
    .addColumn('created_by', 'varchar(128)', column => column.notNull())
    .addColumn('updated_by', 'varchar(128)', column => column.notNull())
    .addColumn('deleted_at', 'timestamptz').addColumn('deleted_by', 'varchar(128)')
    .addUniqueConstraint('default_companies_public_id_unique', ['public_id'])
    .addUniqueConstraint('default_companies_tenant_identity_unique', ['tenant_id','id'])
    .addCheckConstraint('default_companies_public_id_format', sql`public_id ~ '^[a-z0-9]{8}$'`)
    .addCheckConstraint('default_companies_name_nonblank', sql`length(trim(name)) > 0`)
    .execute();
  await db.schema.alterTable('default_companies').addForeignKeyConstraint('default_companies_company_id_tenant_fk', ['tenant_id','company_id'], 'companies', ['tenant_id','id']).onDelete('restrict').execute();
  await db.schema.alterTable('default_companies').addCheckConstraint('default_companies_company_id_required', sql`company_id is not null`).execute();
  await db.schema.alterTable('default_companies').addForeignKeyConstraint('default_companies_financial_year_id_tenant_fk', ['tenant_id','financial_year_id'], 'financial_years', ['tenant_id','id']).onDelete('restrict').execute();
  await db.schema.alterTable('default_companies').addCheckConstraint('default_companies_financial_year_id_required', sql`financial_year_id is not null`).execute();
  await sql`create unique index default_companies_name_unique on default_companies (tenant_id, company_id, lower(name))`.execute(db);
  await db.schema.createIndex('default_companies_tenant_unique').on('default_companies').column('tenant_id').unique().execute();
}

export async function down(db: Kysely<unknown>) { await db.schema.dropTable('default_companies').execute(); }
