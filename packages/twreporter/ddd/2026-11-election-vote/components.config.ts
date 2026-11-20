import type { ComponentConfig } from '@lab-reporter/ddd-shared/vite-config'
import { firstBatch } from './src/lib/batches/first.ts'

const batches = [firstBatch]
const registeredComponents = new Map<string, ComponentConfig>()

for (const batch of batches) {
  for (const { name } of batch.graphics) {
    if (registeredComponents.has(name)) {
      throw new Error(
        `Election component name "${name}" is used by multiple entries.`,
      )
    }
    registeredComponents.set(name, {
      entry: `src/wc/${name}.ts`,
      outputDirectory: `components/${name}`,
      configSchema: batch.schema,
    })
  }
}

export const components = Object.fromEntries(registeredComponents)
