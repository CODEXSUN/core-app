import{sql,type Kysely,type SelectQueryBuilder}from'kysely';
import{modulePageQuerySchema,type ModulePage}from'../../../contracts/module-page.ts';
import{z}from'zod';
import{ModulePageSizeError}from'../http.ts';
export type ModulePageColumns=Readonly<Record<string,{field:string;boolean?:boolean;referenceField?:string}>>;
/** Pagination only: the owning repository supplies its already tenant/lifecycle-scoped query and explicit displayed-column allowlist. */
export async function pageModuleRecords<Row extends Record<string,unknown>>(db:Kysely<any>,scoped:SelectQueryBuilder<any,any,Row>,input:unknown,columns:ModulePageColumns):Promise<ModulePage<Record<string,unknown>>>{
 const options=modulePageQuerySchema.parse(input),sort=options.sort??'name';
 const allowed=z.enum(Object.keys(columns) as [string,...string[]]);allowed.parse(sort);for(const field of Object.keys(options.filters))allowed.parse(field);
 for(const field of Object.keys(options.references))if(!columns[field]?.referenceField)z.never().parse(field);
 let selected=db.selectFrom(scoped.as('page_records'));
 for(const[field,value]of Object.entries(options.references))selected=selected.where(sql<boolean>`${sql.ref('page_records.'+columns[field].referenceField!)} = ${value}`);
 const text=(key:string)=>{const field=sql.ref('page_records.'+columns[key].field);return columns[key].boolean?sql<string>`CASE WHEN ${field} THEN 'Yes' ELSE 'No' END`:sql<string>`COALESCE(CAST(${field} AS text),'')`;};
 const pattern=(value:string)=>'%'+value.replace(/[\\%_]/g,part=>'\\'+part)+'%';
 if(options.q)selected=selected.where(eb=>eb.or(Object.keys(columns).map(key=>sql<boolean>`${text(key)} ILIKE ${pattern(options.q)}`)));
 if(options.filterId)selected=selected.where(sql<boolean>`${sql.ref('page_records.active')} = ${options.filterId==='active'}`);
 for(const[key,value]of Object.entries(options.filters))if(value)selected=selected.where(sql<boolean>`${text(key)} ILIKE ${pattern(value)}`);
 const fields=[...new Set(['public_id','active',...Object.values(columns).map(column=>column.field)])];
 const[rows,count]=await Promise.all([
  selected.select(fields.map(field=>sql.ref('page_records.'+field).as(field))).orderBy(sql.ref('page_records.'+columns[sort].field),options.direction).orderBy(sql.ref('page_records.public_id'),'asc').offset((options.page-1)*options.pageSize).limit(options.pageSize).execute(),
  selected.select(eb=>eb.fn.countAll().as('total')).executeTakeFirstOrThrow(),
 ]);
 const result={rows:rows.map(row=>Object.fromEntries(fields.map(field=>{const value=(row as Record<string,unknown>)[field];return[field,value instanceof Date?value.toISOString():value??''];}))),total:Number(count.total),page:options.page,pageSize:options.pageSize};
 if(Buffer.byteLength(JSON.stringify(result))>1024*1024)throw new ModulePageSizeError();
 return result;
}
