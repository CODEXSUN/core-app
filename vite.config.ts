import { developmentWebServer } from '@workspace/framework';
import { createThemeInitScript } from '@workspace/ui/design-system/bootstrap';
import { appDetails } from './contracts/app.ts';
import { defineConfig } from 'vite';
import tailwindcss from '@tailwindcss/vite';
import { fileURLToPath } from 'node:url';

export default defineConfig({
  server: developmentWebServer({ root: fileURLToPath(new URL('./', import.meta.url)), prefix: 'CORE_APP', defaultPort: 4345, defaultWebPort: 4340 }),
  root: fileURLToPath(new URL('./src/web', import.meta.url)),
  resolve: { dedupe: ['react', 'react-dom'] },
  plugins: [{ name: 'shared-theme-init', transformIndexHtml: { order: 'pre', handler: () => [{ tag: 'script', children: createThemeInitScript(`${appDetails.name}.ui.preferences`), injectTo: 'head-prepend' }] } }, tailwindcss()],
  build: { rolldownOptions: { onLog(level, log, defaultHandler) {
    // Client boundaries are irrelevant in this browser-only build.
    if (level === 'warn' && log.code === 'MODULE_LEVEL_DIRECTIVE' && log.message.includes('"use client"')) return;
    defaultHandler(level, log);
  } }, outDir: fileURLToPath(new URL('./dist/web', import.meta.url)), emptyOutDir: true },
});
