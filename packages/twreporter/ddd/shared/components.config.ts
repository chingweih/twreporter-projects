import type { ComponentConfig } from './config/vite.ts'
import { barChartConfigSchema } from './src/components/bar-chart/types.ts'
import { fullScreenWrapperConfigSchema } from './src/components/full-screen-wrapper/types.ts'
import { tableConfigSchema } from './src/components/table/types.ts'

export const components = {
  'bar-chart': {
    entry: 'src/components/bar-chart/index.ts',
    outputDirectory: 'components/bar-chart',
    configSchema: barChartConfigSchema,
  },
  table: {
    entry: 'src/components/table/index.ts',
    outputDirectory: 'components/table',
    configSchema: tableConfigSchema,
  },
  'full-screen-wrapper': {
    entry: 'src/components/full-screen-wrapper/index.ts',
    outputDirectory: 'components/full-screen-wrapper',
    configSchema: fullScreenWrapperConfigSchema,
  },
} satisfies Record<string, ComponentConfig>
