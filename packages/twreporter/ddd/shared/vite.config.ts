import { resolve } from 'node:path'
import { svelte } from '@sveltejs/vite-plugin-svelte'
import { defineConfig, type EnvironmentOptions, type Plugin } from 'vite'
import { z } from 'zod'
import { tableConfigSchema } from './src/components/table/types'
import { fullScreenWrapperConfigSchema } from './src/components/full-screen-wrapper/types'

const components = {
  table: {
    entry: 'src/components/table/index.ts',
    outputDirectory: 'components/table',
    configSchema: tableConfigSchema,
  },
  fullScreenWrapper: {
    entry: 'src/components/full-screen-wrapper/index.ts',
    outputDirectory: 'components/full-screen-wrapper',
    configSchema: fullScreenWrapperConfigSchema,
  },
} as const

const timestamp = Date.now()

function generatedSchema(
  name: string,
  component: (typeof components)[keyof typeof components],
): Plugin {
  const schemaId = `\0${name}.schema-url.js`
  const schemaImportSuffix = `dist/${component.outputDirectory}/${name}.schema.json?url&no-inline`

  return {
    name: `twreporter-generated-schema-${name}`,
    apply: 'build',
    enforce: 'pre',
    resolveId(id) {
      if (id.endsWith(schemaImportSuffix)) return schemaId
    },
    load(id) {
      if (id !== schemaId) return
      const referenceId = this.emitFile({
        type: 'asset',
        name: `${name}.schema.json`,
        source: JSON.stringify(z.toJSONSchema(component.configSchema), null, 2),
      })
      return `export default import.meta.ROLLUP_FILE_URL_${referenceId}`
    },
  }
}

export default defineConfig({
  base: './',
  // TanStack Query uses this Node-style guard for development-only warnings.
  // Library builds do not replace it automatically, so leaving it in the
  // browser bundle causes `process is not defined` at runtime.
  define: {
    'process.env.NODE_ENV': JSON.stringify('production'),
  },
  plugins: [
    ...Object.entries(components).map(([name, component]) =>
      generatedSchema(name, component),
    ),
    svelte({ emitCss: false }),
  ],
  builder: {
    async buildApp(builder) {
      for (const name of Object.keys(components)) {
        await builder.build(builder.environments[name])
      }
    },
  },
  environments: Object.fromEntries(
    Object.entries(components).map(([name, component]) => [
      name,
      {
        consumer: 'client',
        build: {
          outDir: resolve(
            import.meta.dirname,
            'dist',
            component.outputDirectory,
          ),
          lib: {
            entry: resolve(import.meta.dirname, component.entry),
            formats: ['es'],
          },
          rolldownOptions: {
            output: {
              codeSplitting: false,
              entryFileNames: `${name}-${timestamp}.js`,
              assetFileNames: (assetInfo) =>
                assetInfo.names.some((assetName) =>
                  assetName.endsWith('.schema.json'),
                )
                  ? `${name}-${timestamp}.schema.json`
                  : `${name}-${timestamp}.[ext]`,
            },
          },
        },
      } satisfies EnvironmentOptions,
    ]),
  ),
  build: {
    assetsInlineLimit: 0,
    cssCodeSplit: false,
    emptyOutDir: true,
    sourcemap: false,
  },
})
