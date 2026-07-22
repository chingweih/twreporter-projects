import { mkdir, rename } from 'node:fs/promises'
import { resolve } from 'node:path'
import { defineConfig, type Plugin } from 'vite'

function organizeAssets(): Plugin {
  let outputDir: string
  return {
    name: 'organize-assets',
    configResolved(config) {
      outputDir = resolve(config.root, config.build.outDir)
    },
    async closeBundle() {
      const assetsDir = resolve(outputDir, 'assets')
      await mkdir(assetsDir, { recursive: true })
      await Promise.all(
        ['img', 'vid'].map((folder) =>
          rename(resolve(outputDir, folder), resolve(assetsDir, folder)),
        ),
      )
    },
  }
}

function allowLocalDevelopmentEmbed(): Plugin {
  return {
    name: 'allow-local-development-embed',
    configureServer(server) {
      server.middlewares.use((_request, response, next) => {
        response.setHeader('Access-Control-Allow-Private-Network', 'true')
        next()
      })
    },
  }
}

export default defineConfig({
  publicDir: 'src/lib/assets',
  plugins: [allowLocalDevelopmentEmbed(), organizeAssets()],
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
      fileName: () => 'js/dynamicLayout.js',
    },
  },
})
