import { z } from 'zod'
import { createShellConfigSchema } from '@lab-reporter/ddd-shared/components/shared/types.ts'
import defaultConfig from '../../../../public/card-explorer.json' with { type: 'json' }

export const cardExplorerConfigSchema = createShellConfigSchema(defaultConfig)

export type CardExplorerConfig = z.infer<typeof cardExplorerConfigSchema>
