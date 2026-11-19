import {useEffect,useMemo,useState,useSyncExternalStore} from 'react';
import {Button} from '@workspace/ui';
import {Dialog,DialogContent,DialogDescription,DialogHeader,DialogTitle} from '@workspace/ui/components/dialog';
import {MasterListV1,type MasterListRemote} from '@workspace/ui/blocks/data-table';
import {createReferencePageController,createSelectedReferenceController,type ReferencePageLoader,type ReferenceSelectedLoader} from './reference-controller';
import type {ReferenceRecord} from './reference-transport';

export type ReferencePickerProps={id?:string;ariaLabel:string;value:string;loadPage:ReferencePageLoader;loadSelected:ReferenceSelectedLoader;onValueChange:(value:string,option?:ReferenceRecord)=>void;disabled?:boolean;required?:boolean;scopeKey?:string};
export function ReferencePicker({id,ariaLabel,value,loadPage,loadSelected,onValueChange,disabled=false,required=false,scopeKey=''}:ReferencePickerProps){
 const [open,setOpen]=useState(false);
 const pages=useMemo(()=>createReferencePageController(loadPage),[loadPage,scopeKey]);
 const selected=useMemo(()=>createSelectedReferenceController(loadSelected),[loadSelected,scopeKey]);
 const pageState=useSyncExternalStore(pages.subscribe,pages.snapshot,pages.snapshot),selection=useSyncExternalStore(selected.subscribe,selected.snapshot,selected.snapshot);
 useEffect(()=>{selected.change(value);return()=>selected.stop();},[selected,value]);
 useEffect(()=>{if(open&&!disabled)pages.start();return()=>pages.stop();},[pages,open,disabled]);
 const resolved=selection.value===value?selection.record:undefined,error=selection.value===value?selection.error:'';
 const loadingSelection=!!value&&(selection.value!==value||selection.loading);
 const remote:MasterListRemote<ReferenceRecord>={query:pageState.query,total:pageState.total,onQueryChange:pages.change,filterOptions:[]};
 const choose=(row:ReferenceRecord)=>{if(!row.active)return;onValueChange(row.public_id,row);setOpen(false);};
 return <div className="min-w-0 space-y-2">
  <div className="flex min-w-0 gap-2"><Button id={id} type="button" variant="outline" className="min-w-0 flex-1 justify-start overflow-hidden" disabled={disabled} aria-label={ariaLabel} aria-haspopup="dialog" aria-expanded={open} aria-required={required} onClick={()=>setOpen(true)}><span className="truncate">{loadingSelection?'Loading selection…':resolved?resolved.name+(resolved.active?'':' (inactive)'):value?'Selection unavailable':'Choose '+ariaLabel.toLowerCase()}</span></Button>{value&&<Button type="button" variant="outline" disabled={disabled} aria-label={'Clear '+ariaLabel} onClick={()=>onValueChange('')}>Clear</Button>}</div>
  {error&&<div role="alert" className="text-sm text-destructive">{error} <Button type="button" variant="link" disabled={disabled} onClick={()=>selected.change(value)}>Retry selection</Button></div>}
  <Dialog open={open&&!disabled} onOpenChange={setOpen}><DialogContent className="max-h-[90dvh] min-w-0 w-[calc(100vw_-_2rem)] max-w-4xl grid-cols-[minmax(0,1fr)] overflow-y-auto p-4 sm:p-6"><DialogHeader className="min-w-0"><DialogTitle>Choose {ariaLabel.toLowerCase()}</DialogTitle><DialogDescription>Search active records. Only the current server page is loaded.</DialogDescription></DialogHeader>
   <MasterListV1 className="min-w-0 w-full" label={ariaLabel} data={pageState.rows} columns={[{id:'name',label:'Name',value:row=>row.name,render:row=><Button type="button" variant="link" className="h-auto whitespace-normal p-0 text-left" aria-label={'Choose '+row.name} onClick={()=>choose(row)}>{row.name}</Button>}]} getRowId={row=>row.public_id} remote={remote} allFilterLabel="Active records" loading={pageState.loading||pageState.total===null&&!pageState.error} error={pageState.error||undefined} onRetry={pages.retry} emptyMessage="No active matching references."/>
  </DialogContent></Dialog>
 </div>;
}
