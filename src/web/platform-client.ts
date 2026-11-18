import {createPlatformBrowserClient} from '@workspace/sdk/platform-browser-client';
export const platform=createPlatformBrowserClient('core-app');
export const appFetch=platform.fetch;
