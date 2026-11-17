import { sql, type Kysely } from 'kysely';
// Module-owned schema. Never rewrite this migration after it has been applied.
export async function up(db: Kysely<unknown>) {
  await db.schema.createTable('cities')
    .addColumn('id', 'integer', column => column.generatedAlwaysAsIdentity().primaryKey())
    .addColumn('public_id', 'varchar(32)', column => column.notNull())
    .addColumn('tenant_id', 'varchar(128)', column => column.notNull())
    .addColumn('name', 'varchar(120)', column => column.notNull())
    .addColumn('district_id', 'integer')
    .addColumn('sort_order', 'integer', column => column.notNull())
    .addColumn('active', 'boolean', column => column.notNull().defaultTo(true))
    .addColumn('created_at', 'timestamptz', column => column.notNull().defaultTo(sql`CURRENT_TIMESTAMP`))
    .addColumn('updated_at', 'timestamptz', column => column.notNull().defaultTo(sql`CURRENT_TIMESTAMP`))
    .addColumn('created_by', 'varchar(128)', column => column.notNull())
    .addColumn('updated_by', 'varchar(128)', column => column.notNull())
    .addColumn('deleted_at', 'timestamptz').addColumn('deleted_by', 'varchar(128)')
    .addUniqueConstraint('cities_public_id_unique', ['public_id'])
    .addUniqueConstraint('cities_tenant_identity_unique', ['tenant_id','id'])
    .addCheckConstraint('cities_public_id_format', sql`public_id ~ '^[a-z0-9]{8}$'`)
    .addCheckConstraint('cities_name_nonblank', sql`length(trim(name)) > 0`)
    .execute();
  await db.schema.alterTable('cities').addForeignKeyConstraint('cities_district_id_tenant_fk', ['tenant_id','district_id'], 'districts', ['tenant_id','id']).onDelete('restrict').execute();
  await db.schema.alterTable('cities').addCheckConstraint('cities_district_id_required', sql`district_id is not null`).execute();
  await sql`create unique index cities_name_unique on cities (tenant_id, district_id, lower(name))`.execute(db);
}

export async function down(db: Kysely<unknown>) { await db.schema.dropTable('cities').execute(); }
