import { sql, type Kysely } from 'kysely';
// Additive upgrade: existing data, IDs, links and the first three migrations are preserved.
export async function up(db: Kysely<unknown>) {
  await db.schema.alterTable('financial_years').addUniqueConstraint('financial_years_tenant_identity_unique', ['tenant_id','id']).execute();

}

// This upgrade adds master data fields. Automatic destructive rollback is refused. Restore a reviewed backup if recovery is required.
export async function down(_db: Kysely<unknown>) { throw new Error('Additive master upgrade requires reviewed recovery; no data was dropped.'); }
