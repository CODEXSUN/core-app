import { developmentWebServer } from '@workspace/framework';
import { createThemeInitScript } from '@workspace/ui/design-system/bootstrap';
import { createGlobalLoaderBootstrap } from '@workspace/ui/components/global-loader-bootstrap';
import { readFileSync } from 'node:fs';
import { appDetails } from './contracts/app.ts';
import { defineConfig } from 'vite';
import tailwindcss from '@tailwindcss/vite';
import { fileURLToPath } from 'node:url';

const loaderLogo = (name: string) => 'data:image/svg+xml;base64,' + readFileSync(new URL(`./src/web/assets/${name}`, import.meta.url)).toString('base64');
const loaderBootstrap = createGlobalLoaderBootstrap({ name: 'Core', logoSrc: loaderLogo('brand-logo.svg'), logoDarkSrc: loaderLogo('brand-logo-dark.svg') });

export default defineConfig({
  server: platformWebServer({ root: fileURLToPath(new URL('./', import.meta.url)), prefix: 'CORE_APP', defaultPort: 4345, defaultWebPort: 4340 }),
  root: fileURLToPath(new URL('./src/web', import.meta.url)),
  resolve: { dedupe: ['react', 'react-dom'] },
  plugins: [{ name: 'shared-theme-init', transformIndexHtml: { order: 'pre', handler: () => [{ tag: 'script', children: createThemeInitScript(`${appDetails.name}.ui.preferences`, { migrateToSilver: true }), injectTo: 'head-prepend' }] } }, { name: 'shared-loader-bootstrap', transformIndexHtml: { order: 'pre', handler: html => html.replace('</head>', loaderBootstrap.head + '</head>').replace('<body>', '<body>' + loaderBootstrap.body) } }, tailwindcss()],
  build: { rolldownOptions: { onLog(level, log, defaultHandler) {
    // Client boundaries are irrelevant in this browser-only build.
    if (level === 'warn' && log.code === 'MODULE_LEVEL_DIRECTIVE' && log.message.includes('"use client"')) return;
    defaultHandler(level, log);
  } }, outDir: fileURLToPath(new URL('./dist/web', import.meta.url)), emptyOutDir: true },
});

function platformWebServer(options:Parameters<typeof developmentWebServer>[0]){const server=developmentWebServer(options);return {...server,proxy:{...server.proxy,'/platform-api':server.proxy!['/api']}};}
