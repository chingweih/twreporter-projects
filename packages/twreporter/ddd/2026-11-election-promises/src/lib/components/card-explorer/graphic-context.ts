import type { createGraphic } from '@lab-reporter/ddd-shared/utils/graphic-data.svelte.ts'
import type { CardExplorerConfig } from './types.ts'

export const cardExplorerGraphicContext = Symbol('card-explorer-graphic')
export type CardExplorerGraphic = ReturnType<
  typeof createGraphic<CardExplorerConfig>
>
