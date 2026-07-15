import { resolve } from 'node:path'
import { defineConfig } from 'vite'
import { svelte } from '@sveltejs/vite-plugin-svelte'

export default defineConfig({
  publicDir: 'src/lib/img',
  define: {
    ASSET_BASE: JSON.stringify(
      process.env.RELEASE === 'prod'
        ? 'https://projects.twreporter.org/twreporter/ddd/2026-07-kodokushi/'
        : '/',
    ),
  },
  plugins: [
    svelte({
      dynamicCompileOptions: ({ filename }) =>
        filename.endsWith('.wc.svelte') ? { customElement: true } : {},
    }),
  ],
  build: {
    lib: {
      entry: resolve(import.meta.dirname, 'src/web-components.js'),
      formats: ['umd'],
      name: 'TwreporterDynamicLayout',
      fileName: () => 'dynamicLayout.js',
    },
  },
})
