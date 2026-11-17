import { sql, type Kysely } from 'kysely';
// Module-owned schema. Never rewrite this migration after it has been applied.
export async function up(db: Kysely<unknown>) {
  await db.schema.createTable('districts')
    .addColumn('id', 'integer', column => column.generatedAlwaysAsIdentity().primaryKey())
    .addColumn('public_id', 'varchar(32)', column => column.notNull())
    .addColumn('tenant_id', 'varchar(128)', column => column.notNull())
    .addColumn('name', 'varchar(120)', column => column.notNull())
    .addColumn('state_id', 'integer')
    .addColumn('sort_order', 'integer', column => column.notNull())
    .addColumn('active', 'boolean', column => column.notNull().defaultTo(true))
    .addColumn('created_at', 'timestamptz', column => column.notNull().defaultTo(sql`CURRENT_TIMESTAMP`))
    .addColumn('updated_at', 'timestamptz', column => column.notNull().defaultTo(sql`CURRENT_TIMESTAMP`))
    .addColumn('created_by', 'varchar(128)', column => column.notNull())
    .addColumn('updated_by', 'varchar(128)', column => column.notNull())
    .addColumn('deleted_at', 'timestamptz').addColumn('deleted_by', 'varchar(128)')
    .addUniqueConstraint('districts_public_id_unique', ['public_id'])
    .addUniqueConstraint('districts_tenant_identity_unique', ['tenant_id','id'])
    .addCheckConstraint('districts_public_id_format', sql`public_id ~ '^[a-z0-9]{8}$'`)
    .addCheckConstraint('districts_name_nonblank', sql`length(trim(name)) > 0`)
    .execute();
  await db.schema.alterTable('districts').addForeignKeyConstraint('districts_state_id_tenant_fk', ['tenant_id','state_id'], 'states', ['tenant_id','id']).onDelete('restrict').execute();
  await db.schema.alterTable('districts').addCheckConstraint('districts_state_id_required', sql`state_id is not null`).execute();
  await sql`create unique index districts_name_unique on districts (tenant_id, state_id, lower(name))`.execute(db);
}

export async function down(db: Kysely<unknown>) { await db.schema.dropTable('districts').execute(); }
