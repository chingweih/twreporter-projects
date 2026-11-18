import type { ComponentConfig } from '@lab-reporter/ddd-shared/vite-config'
import { cardExplorerConfigSchema } from './src/lib/components/card-explorer/types.ts'

export const components = {
  ['card-explorer']: {
    entry: 'src/wc/card-explorer.ts',
    outputDirectory: 'components/card-explorer',
    configSchema: cardExplorerConfigSchema,
  },
} satisfies Record<string, ComponentConfig>
