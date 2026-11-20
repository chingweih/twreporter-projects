import type { ComponentConfig } from '@lab-reporter/ddd-shared/vite-config'
import { cardExplorerConfigSchema } from './src/lib/components/card-explorer/types.ts'
import { citySelectorConfigSchema } from './src/lib/components/city-selector/types.ts'

export const components = {
  ['city-selector']: {
    entry: 'src/wc/city-selector.ts',
    outputDirectory: 'components/city-selector',
    configSchema: citySelectorConfigSchema,
  },
  ['card-explorer']: {
    entry: 'src/wc/card-explorer.ts',
    outputDirectory: 'components/card-explorer',
    configSchema: cardExplorerConfigSchema,
  },
  ['card-comparison']: {
    entry: 'src/wc/card-comparison.ts',
    outputDirectory: 'components/card-comparison',
    configSchema: cardExplorerConfigSchema,
  },
} satisfies Record<string, ComponentConfig>
