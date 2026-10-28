import { z } from 'zod'
import { createShellConfigSchema } from '@lab-reporter/ddd-shared/components/shared/types.ts'
import defaultConfig from '../../../../public/player-track-map.json' with { type: 'json' }

export const playerTrackMapConfigSchema = createShellConfigSchema(defaultConfig)

export type PlayerTrackMapConfig = z.infer<typeof playerTrackMapConfigSchema>
