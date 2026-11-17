import { sql, type Kysely } from 'kysely';
// Additive upgrade: existing data, IDs, links and the first three migrations are preserved.
export async function up(db: Kysely<unknown>) {
  await db.schema.alterTable('contacts').addUniqueConstraint('contacts_tenant_identity_unique', ['tenant_id','id']).execute();
  await db.schema.alterTable('contacts').addColumn('type_id', 'integer').execute();
  await db.schema.alterTable('contacts').addColumn('group_id', 'integer').execute();
  await db.schema.alterTable('contacts').addColumn('msme_no', 'varchar(300)', column => column.notNull().defaultTo('')).execute();
  await db.schema.alterTable('contacts').addColumn('msme_category', 'varchar(300)', column => column.notNull().defaultTo('')).execute();
  await db.schema.alterTable('contacts').addColumn('tan_no', 'varchar(300)', column => column.notNull().defaultTo('')).execute();
  await db.schema.alterTable('contacts').addColumn('tds_available', 'boolean', column => column.notNull().defaultTo(false)).execute();
  await db.schema.alterTable('contacts').addColumn('tcs_available', 'boolean', column => column.notNull().defaultTo(false)).execute();
  await db.schema.alterTable('contacts').addColumn('credit_limit', sql`numeric(18,4)`, column => column.notNull().defaultTo('0.0000')).execute();
  await db.schema.alterTable('contacts').addColumn('bank_accounts', 'jsonb', column => column.notNull().defaultTo(sql`'[]'::jsonb`)).execute();
  await db.schema.alterTable('contacts').addColumn('social_links', 'jsonb', column => column.notNull().defaultTo(sql`'[]'::jsonb`)).execute();
  await db.schema.alterTable('contacts').addForeignKeyConstraint('contacts_type_id_tenant_fk', ['tenant_id','type_id'], 'contact_types', ['tenant_id','id']).onDelete('restrict').execute();
  await db.schema.alterTable('contacts').addForeignKeyConstraint('contacts_group_id_tenant_fk', ['tenant_id','group_id'], 'contact_groups', ['tenant_id','id']).onDelete('restrict').execute();
  await db.schema.alterTable('contacts').addCheckConstraint('contacts_credit_limit_nonnegative', sql`credit_limit >= 0`).execute();
}

// This upgrade adds master data fields. Automatic destructive rollback is refused. Restore a reviewed backup if recovery is required.
export async function down(_db: Kysely<unknown>) { throw new Error('Additive master upgrade requires reviewed recovery; no data was dropped.'); }
