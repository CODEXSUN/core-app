import {pageModuleRecords} from '../../../database/page.ts';
import { randomInt } from "node:crypto";
import { sql, type Kysely } from "kysely";
import type { Database } from "../../../database/schema.ts";
import type { ModuleContext } from "../../../database/context.ts";
import { ConflictError } from "../../../http.ts";
import type { ProductValues } from "../../../../../contracts/product.ts";
import type {BillingLookupQuery} from '../../../../../contracts/billing-catalog.ts';
import { resolveProductTypeReference } from "../../common/product-type/index.ts";
import { resolveProductCategoryReference } from "../../common/product-category/index.ts";
import { resolveProductGroupReference } from "../../common/product-group/index.ts";
import { resolveHsnCodeReference } from "../../common/hsn-code/index.ts";
import { resolveUnitReference } from "../../common/unit/index.ts";
import { resolveTaxReference } from "../../common/tax/index.ts";
import { resolveBrandReference } from "../../common/brand/index.ts";

const alphabet = "abcdefghijklmnopqrstuvwxyz0123456789";
function billingQuery(db:Kysely<Database>,context:ModuleContext,input:BillingLookupQuery){
 let selected=db.selectFrom('products').innerJoin('units as billing_unit',join=>join.onRef('billing_unit.id','=','products.unit_id').onRef('billing_unit.tenant_id','=','products.tenant_id')).where('products.tenant_id','=',context.tenantId).where('products.deleted_at','is',null).where('products.active','=',true).where('billing_unit.deleted_at','is',null).where('billing_unit.active','=',true);
 if(input.q){const pattern='%'+input.q.replace(/[\\%_]/g,value=>'\\'+value)+'%';selected=selected.where('products.name','ilike',pattern);}
 return selected;
}
export async function searchBillingProducts(db:Kysely<Database>,context:ModuleContext,input:BillingLookupQuery&{page:number;pageSize:number}){
 const selected=billingQuery(db,context,input);
 const [rows,count]=await Promise.all([
  selected.select(['products.public_id','products.name','products.active','billing_unit.name as unitName']).orderBy('products.name').orderBy('products.public_id').offset((input.page-1)*input.pageSize).limit(input.pageSize).execute(),
  selected.select(eb=>eb.fn.countAll().as('total')).executeTakeFirstOrThrow(),
 ]);
 return {rows,total:Number(count.total),page:input.page,pageSize:input.pageSize};
}
export function findBillingProduct(db:Kysely<Database>,context:ModuleContext,id:string){return billingQuery(db,context,{}).where('products.public_id','=',id).select(['products.public_id','products.name','products.active','billing_unit.name as unitName']).executeTakeFirst();}
export function generateProductPublicId() {
  return Array.from(
    { length: 8 },
    () => alphabet[randomInt(alphabet.length)],
  ).join("");
}
function query(db: Kysely<Database>) {
  return db
    .selectFrom("products")
    .leftJoin("product_types as typeIdRef", (join) =>
      join
        .onRef("typeIdRef.id", "=", "products.type_id")
        .onRef("typeIdRef.tenant_id", "=", "products.tenant_id"),
    )
    .leftJoin("product_categories as productCategoryIdRef", (join) =>
      join
        .onRef("productCategoryIdRef.id", "=", "products.product_category_id")
        .onRef("productCategoryIdRef.tenant_id", "=", "products.tenant_id"),
    )
    .leftJoin("product_groups as productGroupIdRef", (join) =>
      join
        .onRef("productGroupIdRef.id", "=", "products.product_group_id")
        .onRef("productGroupIdRef.tenant_id", "=", "products.tenant_id"),
    )
    .leftJoin("hsn_codes as hsnCodeIdRef", (join) =>
      join
        .onRef("hsnCodeIdRef.id", "=", "products.hsn_code_id")
        .onRef("hsnCodeIdRef.tenant_id", "=", "products.tenant_id"),
    )
    .leftJoin("units as unitIdRef", (join) =>
      join
        .onRef("unitIdRef.id", "=", "products.unit_id")
        .onRef("unitIdRef.tenant_id", "=", "products.tenant_id"),
    )
    .leftJoin("taxes as taxIdRef", (join) =>
      join
        .onRef("taxIdRef.id", "=", "products.tax_id")
        .onRef("taxIdRef.tenant_id", "=", "products.tenant_id"),
    )
    .leftJoin("brands as brandIdRef", (join) =>
      join
        .onRef("brandIdRef.id", "=", "products.brand_id")
        .onRef("brandIdRef.tenant_id", "=", "products.tenant_id"),
    )
    .select([
      "products.id",
      "products.public_id",
      "products.name",
      "products.active",
      "products.created_at",
      "products.updated_at",
      "products.created_by",
      "products.updated_by",
      "products.opening_stock as openingStock",
      "products.opening_rate as openingRate",
      "products.description",
      "typeIdRef.public_id as typeId",
      "typeIdRef.name as typeName",
      "productCategoryIdRef.public_id as productCategoryId",
      "productCategoryIdRef.name as productCategoryName",
      "productGroupIdRef.public_id as productGroupId",
      "productGroupIdRef.name as productGroupName",
      "hsnCodeIdRef.public_id as hsnCodeId",
      "hsnCodeIdRef.name as hsnCodeName",
      "unitIdRef.public_id as unitId",
      "unitIdRef.name as unitName",
      "taxIdRef.public_id as taxId",
      "taxIdRef.name as taxName",
      "taxIdRef.rate_percent as taxRate",
      "hsnCodeIdRef.code as hsnCode",
      "brandIdRef.public_id as brandId",
      "brandIdRef.name as brandName",
    ] as const);
}
type Row = NonNullable<
  Awaited<ReturnType<ReturnType<typeof query>["executeTakeFirst"]>>
>;
function publicRecord(row: Row) {
  const { id, ...rest } = row;
  return {
    ...rest,
    typeId: row.typeId ?? "",
    typeName: row.typeName ?? "",
    productCategoryId: row.productCategoryId ?? "",
    productCategoryName: row.productCategoryName ?? "",
    productGroupId: row.productGroupId ?? "",
    productGroupName: row.productGroupName ?? "",
    hsnCodeId: row.hsnCodeId ?? "",
    hsnCodeName: row.hsnCodeName ?? "",
    unitId: row.unitId ?? "",
    unitName: row.unitName ?? "",
    taxId: row.taxId ?? "",
    taxName: row.taxName ?? "",
    brandId: row.brandId ?? "",
    brandName: row.brandName ?? "",
    taxRate: row.taxRate ?? "0.0000",
    hsnCode: row.hsnCode ?? "",
    created_at: row.created_at.toISOString(),
    updated_at: row.updated_at.toISOString(),
  };
}
export async function listProduct(
  db: Kysely<Database>,
  context: ModuleContext,
) {
  const rows = await query(db)
    .where("products.tenant_id", "=", context.tenantId)
    .where("products.deleted_at", "is", null)
    .orderBy("products.name")
    .execute();
  return rows.map(publicRecord);
}
export async function findProduct(
  db: Kysely<Database>,
  context: ModuleContext,
  publicId: string,
) {
  const row = await query(db)
    .where("products.tenant_id", "=", context.tenantId)
    .where("products.public_id", "=", publicId)
    .where("products.deleted_at", "is", null)
    .executeTakeFirst();
  return row ? publicRecord(row) : undefined;
}
export async function findInternalProduct(
  db: Kysely<Database>,
  context: ModuleContext,
  publicId: string,
) {
  const row = await query(db)
    .where("products.tenant_id", "=", context.tenantId)
    .where("products.public_id", "=", publicId)
    .where("products.deleted_at", "is", null)
    .forShare("products")
    .executeTakeFirst();
  return row ? { ...publicRecord(row), id: row.id } : undefined;
}
async function editable(
  db: Kysely<Database>,
  context: ModuleContext,
  values: ProductValues,
) {
  const typeId = values.typeId
    ? await resolveProductTypeReference(db, context, values.typeId)
    : null;
  const productCategoryId = values.productCategoryId
    ? await resolveProductCategoryReference(
        db,
        context,
        values.productCategoryId,
      )
    : null;
  const productGroupId = values.productGroupId
    ? await resolveProductGroupReference(db, context, values.productGroupId)
    : null;
  const hsnCodeId = values.hsnCodeId
    ? await resolveHsnCodeReference(db, context, values.hsnCodeId)
    : null;
  const unitId = await resolveUnitReference(db, context, values.unitId);
  const taxId = values.taxId
    ? await resolveTaxReference(db, context, values.taxId)
    : null;
  const brandId = values.brandId
    ? await resolveBrandReference(db, context, values.brandId)
    : null;

  return {
    name: values.name,
    active: values.active,
    type_id: typeId?.id ?? null,
    product_category_id: productCategoryId?.id ?? null,
    product_group_id: productGroupId?.id ?? null,
    hsn_code_id: hsnCodeId?.id ?? null,
    unit_id: unitId?.id ?? null,
    tax_id: taxId?.id ?? null,
    brand_id: brandId?.id ?? null,
    opening_stock: values.openingStock,
    opening_rate: values.openingRate,
    description: values.description,
  };
}
export async function insertProduct(
  db: Kysely<Database>,
  context: ModuleContext,
  values: ProductValues,
  generate = generateProductPublicId,
) {
  for (let attempt = 0; attempt < 5; attempt++) {
    try {
      const publicId = generate();
      await db.transaction().execute(async (transaction) => {
        const data = await editable(transaction, context, values);
        await transaction
          .insertInto("products")
          .values({
            ...data,
            public_id: publicId,
            tenant_id: context.tenantId,
            created_by: context.actorId,
            updated_by: context.actorId,
            deleted_at: null,
            deleted_by: null,
          })
          .execute();
      });
      const saved = await findProduct(db, context, publicId);
      if (!saved) throw new Error("Saved record could not be read.");
      return saved;
    } catch (error) {
      const failure = error as { code?: string; constraint?: string };
      if (
        failure.code !== "23505" ||
        failure.constraint !== "products_public_id_unique"
      )
        throw error;
      if (attempt === 4) throw new Error("Unable to allocate a public ID.");
    }
  }
  throw new Error("Unable to allocate a public ID.");
}
export async function updateProduct(
  db: Kysely<Database>,
  context: ModuleContext,
  publicId: string,
  values: ProductValues,
) {
  const changed = await db.transaction().execute(async (transaction) => {
    const existing = await transaction
      .selectFrom("products")
      .selectAll()
      .where("tenant_id", "=", context.tenantId)
      .where("public_id", "=", publicId)
      .where("deleted_at", "is", null)
      .forUpdate()
      .executeTakeFirst();
    if (!existing) return false;
    const data = await editable(transaction, context, values);
    await transaction
      .updateTable("products")
      .set({ ...data, updated_at: new Date(), updated_by: context.actorId })
      .where("id", "=", existing.id)
      .where("tenant_id", "=", context.tenantId)
      .execute();
    return true;
  });
  return changed ? findProduct(db, context, publicId) : undefined;
}

export async function pageProductRecords(db:Kysely<Database>,context:ModuleContext,input:unknown){
 const result=await pageModuleRecords(db,query(db).where('products.tenant_id','=',context.tenantId).where('products.deleted_at','is',null),input,{"name":{"field":"name"},"typeId":{"field":"typeName"},"productCategoryId":{"field":"productCategoryName"},"productGroupId":{"field":"productGroupName"},"hsnCodeId":{"field":"hsnCodeName"},"active":{"field":"active","boolean":true}});
 return result;
}
