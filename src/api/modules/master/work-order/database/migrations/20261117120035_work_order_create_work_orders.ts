import { sql, type Kysely } from 'kysely';
// Module-owned schema. Never rewrite this migration after it has been applied.
export async function up(db: Kysely<unknown>) {
  await db.schema.createTable('work_orders')
    .addColumn('id', 'integer', column => column.generatedAlwaysAsIdentity().primaryKey())
    .addColumn('public_id', 'varchar(32)', column => column.notNull())
    .addColumn('tenant_id', 'varchar(128)', column => column.notNull())
    .addColumn('name', 'varchar(120)', column => column.notNull())
    .addColumn('code', 'varchar(40)', column => column.notNull())
    .addColumn('active', 'boolean', column => column.notNull().defaultTo(true))
    .addColumn('created_at', 'timestamptz', column => column.notNull().defaultTo(sql`CURRENT_TIMESTAMP`))
    .addColumn('updated_at', 'timestamptz', column => column.notNull().defaultTo(sql`CURRENT_TIMESTAMP`))
    .addColumn('created_by', 'varchar(128)', column => column.notNull())
    .addColumn('updated_by', 'varchar(128)', column => column.notNull())
    .addColumn('deleted_at', 'timestamptz').addColumn('deleted_by', 'varchar(128)')
    .addUniqueConstraint('work_orders_public_id_unique', ['public_id'])
    .addUniqueConstraint('work_orders_tenant_identity_unique', ['tenant_id','id'])
    .addCheckConstraint('work_orders_public_id_format', sql`public_id ~ '^[a-z0-9]{8}$'`)
    .addCheckConstraint('work_orders_name_nonblank', sql`length(trim(name)) > 0`)
    .execute();
  await sql`create unique index work_orders_name_unique on work_orders (tenant_id, lower(name))`.execute(db);
  await db.schema.createIndex('work_orders_code_unique').on('work_orders').columns(['tenant_id', 'code']).unique().execute();
}

export async function down(db: Kysely<unknown>) { await db.schema.dropTable('work_orders').execute(); }
