import { sql, type Kysely } from 'kysely';
// Module-owned schema. Never rewrite this migration after it has been applied.
export async function up(db: Kysely<unknown>) {
  await db.schema.createTable('ledgers')
    .addColumn('id', 'integer', column => column.generatedAlwaysAsIdentity().primaryKey())
    .addColumn('public_id', 'varchar(32)', column => column.notNull())
    .addColumn('tenant_id', 'varchar(128)', column => column.notNull())
    .addColumn('name', 'varchar(120)', column => column.notNull())
    .addColumn('ledger_group_id', 'integer')
    .addColumn('sort_order', 'integer', column => column.notNull())
    .addColumn('active', 'boolean', column => column.notNull().defaultTo(true))
    .addColumn('created_at', 'timestamptz', column => column.notNull().defaultTo(sql`CURRENT_TIMESTAMP`))
    .addColumn('updated_at', 'timestamptz', column => column.notNull().defaultTo(sql`CURRENT_TIMESTAMP`))
    .addColumn('created_by', 'varchar(128)', column => column.notNull())
    .addColumn('updated_by', 'varchar(128)', column => column.notNull())
    .addColumn('deleted_at', 'timestamptz').addColumn('deleted_by', 'varchar(128)')
    .addUniqueConstraint('ledgers_public_id_unique', ['public_id'])
    .addUniqueConstraint('ledgers_tenant_identity_unique', ['tenant_id','id'])
    .addCheckConstraint('ledgers_public_id_format', sql`public_id ~ '^[a-z0-9]{8}$'`)
    .addCheckConstraint('ledgers_name_nonblank', sql`length(trim(name)) > 0`)
    .execute();
  await db.schema.alterTable('ledgers').addForeignKeyConstraint('ledgers_ledger_group_id_tenant_fk', ['tenant_id','ledger_group_id'], 'ledger_groups', ['tenant_id','id']).onDelete('restrict').execute();
  await db.schema.alterTable('ledgers').addCheckConstraint('ledgers_ledger_group_id_required', sql`ledger_group_id is not null`).execute();
  await sql`create unique index ledgers_name_unique on ledgers (tenant_id, ledger_group_id, lower(name))`.execute(db);
}

export async function down(db: Kysely<unknown>) { await db.schema.dropTable('ledgers').execute(); }
