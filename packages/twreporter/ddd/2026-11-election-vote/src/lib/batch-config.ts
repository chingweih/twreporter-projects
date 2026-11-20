import { createShellConfigSchema } from '@lab-reporter/ddd-shared/components/shared/types.ts'
import { z } from 'zod'

export const electionComponentPrefix = 'twreporter-2026-11-election-vote'

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
type BatchDefaults = { sharedFootnote: string } & Record<
  ElectionGraphicKey,
  GraphicDefaults
>
export type ElectionBatchConfig = Pick<BatchDefaults, 'sharedFootnote'> &
  Partial<Record<ElectionGraphicKey, GraphicDefaults>>

function graphicConfig(defaults: GraphicDefaults) {
  return createShellConfigSchema({ ...defaults, wide: false, backdrop: true })
    .pick({ title: true, footnotes: true })
    .meta({ title: defaults.title, 'ui:order': ['title', 'footnotes'] })
}

export function defineElectionBatch({
  configUrl,
  previewStoryId,
  defaults: { sharedFootnote, ...graphicDefaults },
}: {
  configUrl: string
  previewStoryId: string
  defaults: BatchDefaults
}) {
  const graphicConfigs: Record<
    ElectionGraphicKey,
    ReturnType<typeof graphicConfig>
  > = {}
  const graphicKeys = Object.keys(graphicDefaults).map((key) =>
    graphicKeySchema.parse(key),
  )
  for (const key of graphicKeys) {
    graphicConfigs[key] = graphicConfig(graphicDefaults[key])
  }

  const schema: z.ZodType<ElectionBatchConfig> = z
    .object({
      sharedFootnote: z.string().default(sharedFootnote).meta({
        title: '共用註解與資料來源',
        'ui:widget': 'textarea',
      }),
      ...graphicConfigs,
    })
    .meta({ title: '開票圖表', 'ui:order': ['sharedFootnote', ...graphicKeys] })

  const name = `${electionComponentPrefix}:${configUrl}`
  return {
    name,
    context: Symbol(name),
    configUrl,
    previewStoryId,
    schema,
    graphics: graphicKeys.map((key) => ({
      key,
      name: key.slice(key.indexOf('-') + 1),
    })),
  }
}

export type ElectionBatch = ReturnType<typeof defineElectionBatch>
