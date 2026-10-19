import z from 'zod'

export const fullScreenWrapperConfigSchema = z.object({
  splashScreenText: z.string(),
})

export type FullScreenWrapperConfig = z.infer<
  typeof fullScreenWrapperConfigSchema
>

export const fullScreenWrapperMessageSchema = z.object({
  type: z.literal('full-screen-wrapper'),
  action: z.enum(['hide-button', 'show-button', 'release', 'lock']),
})

export type FullScreenWrapperMessage = z.infer<
  typeof fullScreenWrapperMessageSchema
>
