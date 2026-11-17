import { sql, type Kysely } from 'kysely';
// Module-owned schema. Never rewrite this migration after it has been applied.
export async function up(db: Kysely<unknown>) {
  await db.schema.createTable('pincodes')
    .addColumn('id', 'integer', column => column.generatedAlwaysAsIdentity().primaryKey())
    .addColumn('public_id', 'varchar(32)', column => column.notNull())
    .addColumn('tenant_id', 'varchar(128)', column => column.notNull())
    .addColumn('name', 'varchar(120)', column => column.notNull())
    .addColumn('city_id', 'integer')
    .addColumn('area', 'varchar(300)', column => column.notNull())
    .addColumn('sort_order', 'integer', column => column.notNull())
    .addColumn('active', 'boolean', column => column.notNull().defaultTo(true))
    .addColumn('created_at', 'timestamptz', column => column.notNull().defaultTo(sql`CURRENT_TIMESTAMP`))
    .addColumn('updated_at', 'timestamptz', column => column.notNull().defaultTo(sql`CURRENT_TIMESTAMP`))
    .addColumn('created_by', 'varchar(128)', column => column.notNull())
    .addColumn('updated_by', 'varchar(128)', column => column.notNull())
    .addColumn('deleted_at', 'timestamptz').addColumn('deleted_by', 'varchar(128)')
    .addUniqueConstraint('pincodes_public_id_unique', ['public_id'])
    .addUniqueConstraint('pincodes_tenant_identity_unique', ['tenant_id','id'])
    .addCheckConstraint('pincodes_public_id_format', sql`public_id ~ '^[a-z0-9]{8}$'`)
    .addCheckConstraint('pincodes_name_nonblank', sql`length(trim(name)) > 0`)
    .execute();
  await db.schema.alterTable('pincodes').addForeignKeyConstraint('pincodes_city_id_tenant_fk', ['tenant_id','city_id'], 'cities', ['tenant_id','id']).onDelete('restrict').execute();
  await db.schema.alterTable('pincodes').addCheckConstraint('pincodes_city_id_required', sql`city_id is not null`).execute();
  await sql`create unique index pincodes_name_unique on pincodes (tenant_id, city_id, lower(name))`.execute(db);
}

export async function down(db: Kysely<unknown>) { await db.schema.dropTable('pincodes').execute(); }
