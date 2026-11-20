import { z } from 'zod'
import { createShellConfigSchema } from '@lab-reporter/ddd-shared/components/shared/types.ts'
import defaultConfig from '../../../../public/mayor-map.json' with { type: 'json' }

export const mayorMapConfigSchema = createShellConfigSchema(defaultConfig)

export type MayorMapConfig = z.infer<typeof mayorMapConfigSchema>
