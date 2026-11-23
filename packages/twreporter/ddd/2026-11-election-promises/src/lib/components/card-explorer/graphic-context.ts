import type { createGraphic } from '@lab-reporter/ddd-shared/utils/graphic-data.svelte.ts'
import { cardExplorerConfigSchema, type CardExplorerConfig } from './types.ts'

export const cardExplorerGraphic = {
  name: 'twreporter-card-explorer',
  schema: cardExplorerConfigSchema,
  context: Symbol('card-explorer-graphic'),
  queryOptions: { refetchOnWindowFocus: false },
}
export type CardExplorerGraphic = ReturnType<
  typeof createGraphic<CardExplorerConfig>
>
