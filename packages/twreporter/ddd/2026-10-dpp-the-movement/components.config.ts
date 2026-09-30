import type { ComponentConfig } from '@lab-reporter/ddd-shared/vite-config'
import { seatingsConfigSchema } from './src/lib/components/seatings/types.ts'
import { detailedBarChartConfigSchema } from './src/lib/components/detailed-bar-chart/types.ts'

export const components = {
  seatings: {
    entry: 'src/wc/seatings.ts',
    outputDirectory: 'components/seatings',
    configSchema: seatingsConfigSchema,
  },
  'detailed-bar-chart': {
    entry: 'src/wc/detailed-bar-chart.ts',
    outputDirectory: 'components/detailed-bar-chart',
    configSchema: detailedBarChartConfigSchema,
  },
} satisfies Record<string, ComponentConfig>
