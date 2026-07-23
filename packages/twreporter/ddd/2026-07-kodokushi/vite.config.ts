import { resolve } from 'node:path'
import { defineConfig } from 'vite'

const timestamp = Date.now()

export default defineConfig({
  publicDir: 'src/lib/assets',
  server: {
    cors: {
      origin: '*',
      preflightContinue: true,
    },
    headers: {
      'Access-Control-Allow-Private-Network': 'true',
    },
  },
  build: {
    lib: {
      entry: resolve(import.meta.dirname, 'src/article-script.ts'),
      formats: ['umd'],
      name: 'TwreporterKodokushi',
      fileName: () => `js/script-${timestamp}.js`,
    },
  },
})
