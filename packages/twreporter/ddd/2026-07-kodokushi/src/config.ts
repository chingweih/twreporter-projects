import { z } from 'zod'
import illustrationData from './illustrations.json'

export const illustrationSchema = z.object({
  target: z.string().min(1).meta({
    title: '區段',
    description: '對應文章錨點的 data-section。',
  }),
  anchor: z.number().int().nonnegative().meta({
    title: '內容區塊索引',
    description: '從 0 開始，包含標題。',
  }),
  src: z.url().meta({ title: '圖片或影片 URL' }),
  x: z.number().meta({
    title: '水平位置',
    description: '以 580px 內容寬度為基準，可為負值。',
  }),
  top: z.number().meta({
    title: '垂直位移',
    description: '相對於內容區塊起點，可為負值。',
  }),
  width: z.number().positive().meta({
    title: '寬度',
    description: '以 580px 內容寬度為基準。',
  }),
})

export const configSchema = z.object({
  desktop: z.array(illustrationSchema)
    .default(() => structuredClone(illustrationData.desktop))
    .meta({ title: '桌機插圖' }),
  mobile: z.array(illustrationSchema)
    .default(() => structuredClone(illustrationData.mobile))
    .meta({ title: '手機插圖', description: 'viewport 小於 768px 時使用。' }),
}).meta({ title: '文繞圖設定' })

export type IllustrationSpec = z.infer<typeof illustrationSchema>
export type GraphicConfig = z.infer<typeof configSchema>
