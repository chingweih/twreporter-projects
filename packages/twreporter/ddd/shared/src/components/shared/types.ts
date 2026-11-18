import { z } from 'zod'

export const shellConfigFields = {
  title: z.string().meta({ title: '標題', 'ui:widget': 'textarea' }),
  subtitle: z
    .string()
    .optional()
    .meta({ title: '副標題', 'ui:widget': 'textarea' }),
  footnotes: z
    .array(z.string().meta({ title: '註解', 'ui:widget': 'textarea' }))
    .meta({ title: '註解與資料來源' }),
  wide: z.boolean().meta({ title: '使用寬版版面' }),
  backdrop: z.boolean().meta({ title: '顯示底色' }),
}

export const shellConfigSchema = z.object({
  ...shellConfigFields,
  title: shellConfigFields.title.default(''),
  footnotes: shellConfigFields.footnotes.default([]),
  wide: shellConfigFields.wide.default(false),
  backdrop: shellConfigFields.backdrop.default(true),
})

export function createShellConfigSchema(
  defaults: z.infer<typeof shellConfigSchema>,
) {
  return z.object({
    ...shellConfigFields,
    title: shellConfigFields.title.default(defaults.title),
    subtitle:
      defaults.subtitle === undefined
        ? shellConfigFields.subtitle
        : shellConfigFields.subtitle.default(defaults.subtitle).optional(),
    footnotes: shellConfigFields.footnotes.default(defaults.footnotes),
    wide: shellConfigFields.wide.default(defaults.wide),
    backdrop: shellConfigFields.backdrop.default(defaults.backdrop),
  })
}

export const colorSchema = z
  .string()
  .regex(/^#[0-9a-fA-F]{6}$/)
  .meta({ title: '顏色', 'ui:widget': 'color' })

export type Color = z.infer<typeof colorSchema>
