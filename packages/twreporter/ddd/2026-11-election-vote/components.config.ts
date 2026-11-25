import type { ComponentConfig } from '@lab-reporter/ddd-shared/vite-config'
import { electionBatches } from './src/lib/batches/index.ts'

const version = 1
const registeredComponents = new Map<string, ComponentConfig>()

for (const batch of electionBatches) {
  for (const name of new Set(batch.graphics.map((graphic) => graphic.name))) {
    if (registeredComponents.has(name)) {
      throw new Error(
        `Election component name "${name}" is used by multiple entries.`,
      )
    }
    registeredComponents.set(name, {
      entry: `src/wc/${name}.ts`,
      outputDirectory: `components/${name}`,
      version,
      configSchema: batch.schema,
    })
  }
}

export const components = Object.fromEntries(registeredComponents)
