import { sql, type Kysely } from 'kysely';
// Module-owned schema. Never rewrite this migration after it has been applied.
export async function up(db: Kysely<unknown>) {
  await db.schema.createTable('products')
    .addColumn('id', 'integer', column => column.generatedAlwaysAsIdentity().primaryKey())
    .addColumn('public_id', 'varchar(32)', column => column.notNull())
    .addColumn('tenant_id', 'varchar(128)', column => column.notNull())
    .addColumn('name', 'varchar(120)', column => column.notNull())
    .addColumn('type_id', 'integer')
    .addColumn('product_category_id', 'integer')
    .addColumn('product_group_id', 'integer')
    .addColumn('hsn_code_id', 'integer')
    .addColumn('unit_id', 'integer')
    .addColumn('tax_id', 'integer')
    .addColumn('brand_id', 'integer')
    .addColumn('opening_stock', sql`numeric(18,4)`, column => column.notNull())
    .addColumn('opening_rate', sql`numeric(18,4)`, column => column.notNull())
    .addColumn('description', 'text', column => column.notNull())
    .addColumn('active', 'boolean', column => column.notNull().defaultTo(true))
    .addColumn('created_at', 'timestamptz', column => column.notNull().defaultTo(sql`CURRENT_TIMESTAMP`))
    .addColumn('updated_at', 'timestamptz', column => column.notNull().defaultTo(sql`CURRENT_TIMESTAMP`))
    .addColumn('created_by', 'varchar(128)', column => column.notNull())
    .addColumn('updated_by', 'varchar(128)', column => column.notNull())
    .addColumn('deleted_at', 'timestamptz').addColumn('deleted_by', 'varchar(128)')
    .addUniqueConstraint('products_public_id_unique', ['public_id'])
    .addUniqueConstraint('products_tenant_identity_unique', ['tenant_id','id'])
    .addCheckConstraint('products_public_id_format', sql`public_id ~ '^[a-z0-9]{8}$'`)
    .addCheckConstraint('products_name_nonblank', sql`length(trim(name)) > 0`)
    .execute();
  await db.schema.alterTable('products').addForeignKeyConstraint('products_type_id_tenant_fk', ['tenant_id','type_id'], 'product_types', ['tenant_id','id']).onDelete('restrict').execute();
  await db.schema.alterTable('products').addForeignKeyConstraint('products_product_category_id_tenant_fk', ['tenant_id','product_category_id'], 'product_categories', ['tenant_id','id']).onDelete('restrict').execute();
  await db.schema.alterTable('products').addForeignKeyConstraint('products_product_group_id_tenant_fk', ['tenant_id','product_group_id'], 'product_groups', ['tenant_id','id']).onDelete('restrict').execute();
  await db.schema.alterTable('products').addForeignKeyConstraint('products_hsn_code_id_tenant_fk', ['tenant_id','hsn_code_id'], 'hsn_codes', ['tenant_id','id']).onDelete('restrict').execute();
  await db.schema.alterTable('products').addForeignKeyConstraint('products_unit_id_tenant_fk', ['tenant_id','unit_id'], 'units', ['tenant_id','id']).onDelete('restrict').execute();
  await db.schema.alterTable('products').addCheckConstraint('products_unit_id_required', sql`unit_id is not null`).execute();
  await db.schema.alterTable('products').addForeignKeyConstraint('products_tax_id_tenant_fk', ['tenant_id','tax_id'], 'taxes', ['tenant_id','id']).onDelete('restrict').execute();
  await db.schema.alterTable('products').addForeignKeyConstraint('products_brand_id_tenant_fk', ['tenant_id','brand_id'], 'brands', ['tenant_id','id']).onDelete('restrict').execute();
  await sql`create unique index products_name_unique on products (tenant_id, type_id, lower(name))`.execute(db);
  await db.schema.alterTable('products').addCheckConstraint('products_opening_stock_nonnegative', sql`opening_stock >= 0`).execute();
  await db.schema.alterTable('products').addCheckConstraint('products_opening_rate_nonnegative', sql`opening_rate >= 0`).execute();
}

export async function down(db: Kysely<unknown>) { await db.schema.dropTable('products').execute(); }
