import { sql, type Kysely } from 'kysely';
// Additive upgrade: existing data, IDs, links and the first three migrations are preserved.
export async function up(db: Kysely<unknown>) {
  await db.schema.alterTable('companies').addUniqueConstraint('companies_tenant_identity_unique', ['tenant_id','id']).execute();
  await db.schema.alterTable('companies').addColumn('msme_no', 'varchar(300)', column => column.notNull().defaultTo('')).execute();
  await db.schema.alterTable('companies').addColumn('msme_category', 'varchar(300)', column => column.notNull().defaultTo('')).execute();
  await db.schema.alterTable('companies').addColumn('tan_no', 'varchar(300)', column => column.notNull().defaultTo('')).execute();
  await db.schema.alterTable('companies').addColumn('tds_available', 'boolean', column => column.notNull().defaultTo(false)).execute();
  await db.schema.alterTable('companies').addColumn('tcs_available', 'boolean', column => column.notNull().defaultTo(false)).execute();
  await db.schema.alterTable('companies').addColumn('logo_url', 'varchar(300)', column => column.notNull().defaultTo('')).execute();
  await db.schema.alterTable('companies').addColumn('logo_dark_url', 'varchar(300)', column => column.notNull().defaultTo('')).execute();
  await db.schema.alterTable('companies').addColumn('favicon_url', 'varchar(300)', column => column.notNull().defaultTo('')).execute();
  await db.schema.alterTable('companies').addColumn('industry_name', 'varchar(300)', column => column.notNull().defaultTo('')).execute();
  await db.schema.alterTable('companies').addColumn('bank_accounts', 'jsonb', column => column.notNull().defaultTo(sql`'[]'::jsonb`)).execute();
  await db.schema.alterTable('companies').addColumn('social_links', 'jsonb', column => column.notNull().defaultTo(sql`'[]'::jsonb`)).execute();
}

// This upgrade adds master data fields. Automatic destructive rollback is refused. Restore a reviewed backup if recovery is required.
export async function down(_db: Kysely<unknown>) { throw new Error('Additive master upgrade requires reviewed recovery; no data was dropped.'); }
