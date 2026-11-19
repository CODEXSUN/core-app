import type {MasterListQueryReason,MasterListRemoteQuery} from '@workspace/ui/blocks/data-table';

export type CoreListPage<T>={rows:T[];total:number;page:number;pageSize:number};
export type CoreListState<T>={query:MasterListRemoteQuery;rows:T[];total:number|null;loading:boolean;error:string;errorStatus?:number};
type Transport=(path:string,options:{signal:AbortSignal;cache:'no-store'})=>Promise<Response>;
export function coreListQuery(query:MasterListRemoteQuery){
 if(!Number.isSafeInteger(query.page)||query.page<0||query.page>=1000000||![10,20,25,50,100].includes(query.pageSize))throw Error('Invalid records page bounds.');
 const result=new URLSearchParams({page:String(query.page+1),pageSize:String(query.pageSize),q:query.search});
 if(query.sort){result.set('sort',query.sort.id);result.set('direction',query.sort.direction);}
 if(query.filterId)result.set('filterId',query.filterId);
 if(Object.keys(query.filters).length)result.set('filters',JSON.stringify(query.filters));
 return result.toString();
}
class ListError extends Error{readonly statusCode:number|undefined;constructor(message:string,statusCode?:number){super(message);this.statusCode=statusCode;}}
/** Controlled request lifecycle only; module owners retain their routes, DTOs and permissions. */
export function createCoreRemoteList<T>(collection:string,send:Transport){
 if(!/^[a-z][a-z0-9-]*$/.test(collection))throw Error('Invalid collection.');
 let state:CoreListState<T>={query:{page:0,pageSize:25,search:'',sort:null,filters:{},filterId:null},rows:[],total:null,loading:false,error:''};
 const listeners=new Set<()=>void>();let active=false,generation=0,controller:AbortController|undefined,timer:ReturnType<typeof setTimeout>|undefined;
 const emit=()=>{for(const listener of listeners)listener();};
 function invalidate(){generation++;controller?.abort();controller=undefined;if(timer!==undefined){clearTimeout(timer);timer=undefined;}}
 async function request(){
  if(!active)return;const ownGeneration=generation,query=state.query,own=new AbortController();controller=own;
  try{
   const response=await send('/api/v1/'+collection+'/page?'+coreListQuery(query),{signal:own.signal,cache:'no-store'});
   const value=await response.json();
   if(!response.ok)throw new ListError(value?.message??'Unable to load records.',response.status);
   const page=value as CoreListPage<T>;
   if(!page||!Array.isArray(page.rows)||page.rows.length>100||page.rows.length>query.pageSize||!Number.isSafeInteger(page.total)||page.total<page.rows.length||page.page!==query.page+1||page.pageSize!==query.pageSize)throw new ListError('The records page returned invalid metadata.');
   if(active&&ownGeneration===generation&&!own.signal.aborted){state={query,rows:page.rows,total:page.total,loading:false,error:''};emit();}
  }catch(error){if(active&&ownGeneration===generation&&!own.signal.aborted){state={query,rows:[],total:null,loading:false,error:error instanceof Error?error.message:'Unable to load records.',...(error instanceof ListError&&error.statusCode!==undefined?{errorStatus:error.statusCode}:{})};emit();}}
 }
 function load(query:MasterListRemoteQuery,delay=0){
  invalidate();state={query,rows:[],total:null,loading:active,error:''};emit();
  if(active){if(delay)timer=setTimeout(()=>{timer=undefined;void request();},delay);else void request();}
 }
 return {
  subscribe(listener:()=>void){listeners.add(listener);return()=>{listeners.delete(listener);};},
  snapshot:()=>state,
  start(){active=true;load(state.query);},
  stop(){active=false;invalidate();state={...state,rows:[],total:null,loading:false};emit();},
  change(query:MasterListRemoteQuery,reason:MasterListQueryReason){load(query,reason==='search'||reason==='columnFilter'?200:0);},
  retry(){load(state.query);},
 };
}
