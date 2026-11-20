import type { ComponentConfig } from '@lab-reporter/ddd-shared/vite-config'
import { mayorMapConfigSchema } from './src/lib/components/mayor-map/types.ts'

export const components = {
  ['mayor-map']: {
    entry: 'src/wc/mayor-map.ts',
    outputDirectory: 'components/mayor-map',
    configSchema: mayorMapConfigSchema,
  },
} satisfies Record<string, ComponentConfig>
