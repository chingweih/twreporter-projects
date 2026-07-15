import { resolve } from 'node:path'
import { defineConfig } from 'vite'
import { svelte } from '@sveltejs/vite-plugin-svelte'

export default defineConfig({
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
      name: 'TwreporterKodokushi',
      fileName: () => 'kodokushi.js',
    },
  },
})
