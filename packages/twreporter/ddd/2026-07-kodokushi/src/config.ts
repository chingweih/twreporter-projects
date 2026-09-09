import { z } from 'zod'
import illustrationData from './illustrations.json'

const positionSchema = z.object({
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

export const illustrationSchema = z.object({
  anchor: z.number().int().nonnegative().meta({
    title: '內容區塊索引',
    description: '從 start 到 end 之間的內容區塊，由 0 開始，包含標題。',
  }),
  src: z.url().meta({ title: '圖片或影片 URL' }),
  desktop: positionSchema.meta({ title: '桌機位置與尺寸' }),
  mobile: positionSchema.meta({
    title: '手機位置與尺寸',
    description: 'viewport 小於 768px 時使用。',
  }),
})

export const configSchema = z.object({
  illustrations: z.array(illustrationSchema)
    .default(() => structuredClone(illustrationData.illustrations))
    .meta({ title: '插圖' }),
}).meta({ title: '文繞圖設定' })

export type IllustrationSpec = z.infer<typeof illustrationSchema>
export type GraphicConfig = z.infer<typeof configSchema>
