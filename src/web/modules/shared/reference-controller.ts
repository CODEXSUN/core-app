import {createCoreRemoteList} from './remote-module-list.ts';
import {referenceRecord,type ReferencePage,type ReferenceRecord} from './reference-transport.ts';
import type {MasterListRemoteQuery} from '@workspace/ui/blocks/data-table';
export type ReferencePageLoader=(query:MasterListRemoteQuery,signal:AbortSignal)=>Promise<ReferencePage>;
export type ReferenceSelectedLoader=(id:string,signal:AbortSignal)=>Promise<ReferenceRecord>;
export function createReferencePageController(loadPage:ReferencePageLoader){
 const controller=createCoreRemoteList<ReferenceRecord>('reference-picker',async(_path,{signal})=>{
  try{const value=await loadPage({...controller.snapshot().query,filterId:'active'},signal);if(value.rows.some(row=>!referenceRecord(row).active))throw Error('Inactive records cannot be selected.');return Response.json(value);}
  catch(error){const status=error&&typeof error==='object'&&'statusCode'in error?Number(error.statusCode):503;return Response.json({message:error instanceof Error?error.message:'Unable to load references.'},{status:Number.isInteger(status)&&status>=400&&status<=599?status:503});}
 });return controller;
}
export type SelectedReferenceState={value:string;record:ReferenceRecord|undefined;loading:boolean;error:string};
export function createSelectedReferenceController(load:ReferenceSelectedLoader){
 let state:SelectedReferenceState={value:'',record:undefined,loading:false,error:''};const listeners=new Set<()=>void>();let generation=0,controller:AbortController|undefined;
 const emit=()=>{for(const listener of listeners)listener();};
 const cancel=()=>{generation++;controller?.abort();controller=undefined;};
 return {
  snapshot:()=>state,
  subscribe(listener:()=>void){listeners.add(listener);return()=>{listeners.delete(listener);};},
  change(value:string){
   cancel();const ownGeneration=generation,own=new AbortController();controller=own;
   state={value,record:undefined,loading:!!value,error:''};emit();
   if(!value)return;
   if(!/^[a-z0-9]{8}$/.test(value)){state={value,record:undefined,loading:false,error:'Select a valid reference.'};emit();return;}
   void load(value,own.signal).then(result=>{
    const record=referenceRecord(result,value);
    if(ownGeneration===generation&&!own.signal.aborted){state={value,record,loading:false,error:''};emit();}
   }).catch(error=>{if(ownGeneration===generation&&!own.signal.aborted){state={value,record:undefined,loading:false,error:error instanceof Error?error.message:'Unable to resolve this selection.'};emit();}});
  },
  stop(){cancel();state={value:'',record:undefined,loading:false,error:''};emit();},
 };
}
