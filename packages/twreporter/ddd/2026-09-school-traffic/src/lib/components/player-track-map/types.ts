import { z } from 'zod'

export const playerTrackMapConfigSchema = z.object({})

export type PlayerTrackMapConfig = z.infer<typeof playerTrackMapConfigSchema>
