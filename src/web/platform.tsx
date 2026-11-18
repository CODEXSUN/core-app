import {createContext,useContext,type ReactNode} from 'react';
import {WorkspaceAccessGate} from '@workspace/ui/blocks/auth/workspace-access-gate';
import {type PlatformSession} from '@workspace/sdk/platform-browser-client';
import {appBrand} from './app-shell';
import {platform} from './platform-client';
export {platform,appFetch} from './platform-client';
const AuthContext=createContext<{session:PlatformSession;logout:()=>Promise<void>}|undefined>(undefined);
export function useWorkspaceAuth(){return useContext(AuthContext);}
export function PlatformGate({children}:{children:ReactNode}){return <WorkspaceAccessGate client={platform} brandName="Core" logoSrc={appBrand.logoSrc} logoDarkSrc={appBrand.logoDarkSrc}
 verify={async session=>{const context=await platform.gateway<{tenantId:string;userId:string}>('/workspace');if(context.tenantId!==session.tenant?.publicId||context.userId!==session.user.publicId)throw Error('Workspace identity could not be verified.');}}>
 {(session,logout)=><AuthContext.Provider value={{session,logout}}>{children}</AuthContext.Provider>}
 </WorkspaceAccessGate>;}
