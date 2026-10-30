import { z } from 'zod'
import defaultConfig from '../../../../public/player-track-map.json' with { type: 'json' }

export const playerTrackMapCardSchema = z
  .object({
    title: z.string().optional().meta({ title: '標題' }),
    text: z.string().meta({
      title: '內文',
      'ui:widget': 'textarea',
    }),
    position: z.number().min(0).max(1).meta({
      title: '位置',
      description:
        '卡片置中時的地圖捲動進度。0 為起點，1 為終點，桌面與手機使用相同位置。',
    }),
    view: z
      .enum(['before', 'after'])
      .default('before')
      .meta({
        title: '背景影像',
        description: '卡片中心通過畫面中心時切換至此背景。',
        'ui:enumNames': ['現況', '改善建議'],
      }),
    highlightMarkerIds: z.array(z.string()).default([]).meta({
      title: '標示點 ID',
      description:
        '卡片中心通過畫面中心時，將這些標示點改為紅色。留空可清除標示。',
    }),
  })
  .meta({
    'ui:order': ['title', 'text', 'position', 'view', 'highlightMarkerIds'],
  })

export const playerTrackMapConfigSchema = z
  .object({
    $schema: z.string().optional().meta({ 'ui:widget': 'hidden' }),
    cards: z
      .array(playerTrackMapCardSchema)
      .default(z.array(playerTrackMapCardSchema).parse(defaultConfig.cards))
      .meta({
        title: '捲動卡片',
        'ui:options': { titleKey: 'title', collapsible: true },
      }),
  })
  .meta({ 'ui:order': ['cards', '$schema'] })

export type PlayerTrackMapCard = z.infer<typeof playerTrackMapCardSchema>
export type PlayerTrackMapConfig = z.infer<typeof playerTrackMapConfigSchema>
