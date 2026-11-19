import {useEffect,useMemo,useSyncExternalStore} from 'react';
import type {MasterListRemote} from '@workspace/ui/blocks/data-table';
import {appFetch} from '../../platform-client';
import {createCoreRemoteList} from './remote-module-list';

export function useRemoteModuleList<T>(collection:string,enabled:boolean){
 const controller=useMemo(()=>createCoreRemoteList<T>(collection,appFetch),[collection]);
 const state=useSyncExternalStore(controller.subscribe,controller.snapshot,controller.snapshot);
 useEffect(()=>{if(enabled)controller.start();else controller.stop();return()=>controller.stop();},[controller,enabled]);
 const remote:MasterListRemote<T>={query:state.query,total:state.total,onQueryChange:controller.change,filterOptions:[{id:'active',label:'Active'},{id:'inactive',label:'Inactive'}]};
 // A newly enabled list is connecting before its first effect starts the request.
 const loading=enabled&&(state.loading||state.total===null&&!state.error);
 return {...state,loading,remote,retry:controller.retry};
}
