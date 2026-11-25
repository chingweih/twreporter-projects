import { createShellConfigSchema } from '@lab-reporter/ddd-shared/components/shared/types.ts'
import { z } from 'zod'

export const electionComponentPrefix = 'twreporter-2026-11-election-vote'

const countingNoteTemplate =
  '註{{vIndex}}：本表統計截至{{vMonth}}月{{vDay}}日{{vHour}}時{{vMin}}分（開票進度{{vProgress}}％），最終票數以中選會公告為準'

const graphicKeySchema = z.templateLiteral([
  z.number().int().positive(),
  '-',
  z.string().min(1),
])
export type ElectionGraphicKey = z.infer<typeof graphicKeySchema>

type GraphicDefaults = Pick<
  Parameters<typeof createShellConfigSchema>[0],
  'title' | 'footnotes'
>
type GraphicDefinition = Pick<GraphicDefaults, 'title'> &
  Partial<Pick<GraphicDefaults, 'footnotes'>> & {
    name?: string
    city?: string
  }
export type ElectionBatchConfig = {
  sharedFootnote: string[]
} & Partial<Record<ElectionGraphicKey, GraphicDefaults>>

function graphicConfig(defaults: GraphicDefaults) {
  return createShellConfigSchema({ ...defaults, wide: false, backdrop: true })
    .pick({ title: true, footnotes: true })
    .meta({ title: defaults.title, 'ui:order': ['title', 'footnotes'] })
}

export function defineElectionBatch({
  configUrl,
  previewStoryId,
  sharedFootnote = [
    countingNoteTemplate,
    '資料來源：中央選舉委員會 ｜ 資料整理：林奕甫、黃靖緯、簡毅慧、江世民',
  ],
  graphics,
}: {
  configUrl: string
  previewStoryId: string
  sharedFootnote?: string[]
  graphics: Record<ElectionGraphicKey, GraphicDefinition>
}) {
  const graphicConfigs: Record<
    ElectionGraphicKey,
    ReturnType<typeof graphicConfig>
  > = {}
  const defaults: ElectionBatchConfig = { sharedFootnote }
  const entries = Object.entries(graphics).map(
    ([entry, { title, footnotes = [], name, city }]) => {
      const key = graphicKeySchema.parse(entry)
      const fields = { title, footnotes }
      defaults[key] = fields
      graphicConfigs[key] = graphicConfig(fields)
      return { key, name: name ?? key.slice(key.indexOf('-') + 1), city }
    },
  )

  const schema: z.ZodType<ElectionBatchConfig> = z
    .object({
      sharedFootnote: z
        .preprocess(
          (value) => {
            const legacyCredit = z.string().safeParse(value)
            return legacyCredit.success
              ? [countingNoteTemplate, legacyCredit.data]
              : value
          },
          z
            .array(z.string().meta({ title: '註解', 'ui:widget': 'textarea' }))
            .default(sharedFootnote),
        )
        .meta({
          title: '共用註解與資料來源',
          description:
            '可用 {{vIndex}}、{{vMonth}}、{{vDay}}、{{vHour}}、{{vMin}}、{{vProgress}} 帶入資料。',
        }),
      ...graphicConfigs,
    })
    .meta({
      title: '開票圖表',
      'ui:order': ['sharedFootnote', ...entries.map(({ key }) => key)],
    })

  const name = `${electionComponentPrefix}:${configUrl}`
  return {
    name,
    context: Symbol(name),
    configUrl,
    previewStoryId,
    schema,
    defaults,
    graphics: entries,
  }
}

export type ElectionBatch = ReturnType<typeof defineElectionBatch>
export type ElectionBatchGraphic = ElectionBatch['graphics'][number]
