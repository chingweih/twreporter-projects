import { resolve } from 'node:path'
import { svelte } from '@sveltejs/vite-plugin-svelte'
import type { UserConfig } from 'vite'
import { z } from 'zod'
import { withComponentVersion } from '../src/utils/component-name.ts'

export type ComponentConfig = {
  entry: string
  outputDirectory: string
  configSchema: z.ZodType
  version?: number
}

type ComponentBuildOptions = {
  root: string
  timestamp: number
}

export default { plugins: [svelte({ emitCss: false })] } satisfies UserConfig

export function createComponentConfig(
  name: string,
  component: ComponentConfig,
  options: ComponentBuildOptions,
): UserConfig {
  const versioned = component.version !== undefined
  const outputDirectory = withComponentVersion(
    component.outputDirectory,
    component.version,
  )
  const scriptName = versioned ? 'embed' : name
  const schemaFileName = versioned
    ? 'schema.json'
    : `${name}-${options.timestamp}.schema.json`
  // Keep the build-time schema import independent of the registry version.
  const schemaImportSuffix = `dist/${component.outputDirectory}/${name}.schema.json?url&no-inline`
  const schemaId = `\0twreporter-schema:${name}`

  return {
    root: options.root,
    publicDir: false,
    base: './',
    define: {
      'process.env.NODE_ENV': JSON.stringify('production'),
      BUILD_TIME: JSON.stringify(options.timestamp),
    },
    plugins: [
      {
        name: 'twreporter-generated-schema',
        enforce: 'pre',
        resolveId(id) {
          if (id.endsWith(schemaImportSuffix)) return schemaId
        },
        load(id) {
          if (id !== schemaId) return
          const referenceId = this.emitFile({
            type: 'asset',
            name: `${name}.schema.json`,
            source: JSON.stringify(
              z.toJSONSchema(component.configSchema, { target: 'draft-07' }),
              null,
              2,
            ),
          })
          return `export default import.meta.ROLLUP_FILE_URL_${referenceId}`
        },
      },
      svelte({ emitCss: false }),
    ],
    build: {
      assetsInlineLimit: 0,
      emptyOutDir: false,
      cssCodeSplit: false,
      lib: {
        entry: resolve(options.root, component.entry),
        formats: ['es'],
      },
      rolldownOptions: {
        output: {
          codeSplitting: false,
          entryFileNames: `${outputDirectory}/${scriptName}-${options.timestamp}.js`,
          assetFileNames: (asset) =>
            asset.names.some((assetName) => assetName.endsWith('.schema.json'))
              ? `${outputDirectory}/${schemaFileName}`
              : `${outputDirectory}/[name]-${options.timestamp}.[ext]`,
        },
      },
    },
  }
}
