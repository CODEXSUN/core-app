import type {MasterListRemoteQuery} from '@workspace/ui/blocks/data-table';
import {appFetch} from '../../platform-client.ts';
import {coreListQuery,type CoreListPage} from './remote-module-list.ts';

export type ReferenceRecord={public_id:string;name:string;active:boolean};
export type ReferencePage<T extends ReferenceRecord=ReferenceRecord>=CoreListPage<T>;
export class ReferenceRequestError extends Error{readonly statusCode:number;constructor(message:string,statusCode:number){super(message);this.statusCode=statusCode;}}
async function read(path:string,signal?:AbortSignal){
 const response=await appFetch(path,{signal,cache:'no-store'});const value=await response.json();
 if(!response.ok)throw new ReferenceRequestError(value?.message??'Unable to access this reference.',response.status);
 return value;
}
export function referenceRecord(value:unknown,expectedId?:string):ReferenceRecord{
 const row=value as Partial<ReferenceRecord>;
 if(!row||typeof row.public_id!=='string'||!/^[a-z0-9]{8}$/.test(row.public_id)||expectedId!==undefined&&row.public_id!==expectedId||typeof row.name!=='string'||!row.name.trim()||typeof row.active!=='boolean')throw new Error('The reference returned an invalid record.');
 return {public_id:row.public_id,name:row.name,active:row.active};
}
export async function loadReferencePage(collection:string,query:MasterListRemoteQuery,signal?:AbortSignal,references?:Readonly<Record<string,string|undefined>>):Promise<ReferencePage>{
 const scoped=Object.fromEntries(Object.entries(references??{}).filter(([,value])=>value!==undefined));
 const exact=Object.keys(scoped).length?JSON.stringify(scoped):'';
 if(exact&&(exact.length>512||Object.values(scoped).some(id=>typeof id!=='string'||!/^[a-z0-9]{8}$/.test(id))))throw new Error('Select a valid parent reference.');
 const page=await read('/api/v1/'+collection+'/page?'+coreListQuery({...query,filterId:'active'})+(exact?'&references='+encodeURIComponent(exact):''),signal);
 if(!page||!Array.isArray(page.rows)||page.rows.length>query.pageSize||page.rows.length>100||!Number.isSafeInteger(page.total)||page.total<page.rows.length||page.page!==query.page+1||page.pageSize!==query.pageSize)throw new Error('The reference returned invalid page metadata.');
 const rows=page.rows.map((row:unknown)=>referenceRecord(row));if(rows.some((row:ReferenceRecord)=>!row.active))throw new Error('The reference returned an inactive selection.');
 return {...page,rows};
}
export async function loadSelectedReference(collection:string,id:string,signal?:AbortSignal):Promise<ReferenceRecord>{
 if(!/^[a-z0-9]{8}$/.test(id))throw new Error('Select a valid reference.');
 return referenceRecord(await read('/api/v1/'+collection+'/'+id,signal),id);
}
