import { z } from 'zod'
import defaults from '../../../public/bar-chart/defaults.json' with { type: 'json' }
import {
  barChartAnnotationSchema,
  barChartOrientationSchema,
  colorSchema,
  createShellConfigSchema,
} from '../shared/types.ts'

const seriesColorSchema = z
  .object({
    series: z.string().trim().min(1).meta({ title: '系列名稱' }),
    color: colorSchema,
  })
  .meta({ 'ui:order': ['series', 'color'] })

export const barChartConfigSchema = createShellConfigSchema(defaults)
  .extend({
    seriesColumn: z.string().trim().min(1).default(defaults.seriesColumn).meta({
      title: '系列欄位',
      description: '系列名稱用於圖例與配色。',
    }),
    valueColumn: z.string().trim().min(1).default(defaults.valueColumn).meta({
      title: '數值欄位',
    }),
    groupColumn: z.string().trim().optional().meta({
      title: '分組欄位',
      description: '欄位值相同的資料歸為一組，空白值歸為無標籤的一組。',
    }),
    labelColumn: z.string().trim().optional().meta({ title: '長條標籤欄位' }),
    orientation: barChartOrientationSchema
      .default(barChartOrientationSchema.parse(defaults.orientation))
      .meta({ title: '方向', 'ui:enumNames': ['直向', '橫向'] }),
    showLegend: z.boolean().default(defaults.showLegend).meta({
      title: '顯示圖例',
    }),
    axisLabel: z.string().optional().meta({ title: '數值軸標籤' }),
    valueSuffix: z.string().optional().meta({ title: '數值後綴' }),
    seriesColors: z
      .array(seriesColorSchema)
      .default(defaults.seriesColors)
      .meta({
        title: '系列配色',
        'ui:options': { titleKey: 'series', collapsible: true },
      }),
    annotations: z
      .array(barChartAnnotationSchema)
      .default(defaults.annotations)
      .meta({
        title: '參考線',
        'ui:options': { titleKey: 'label', collapsible: true },
      }),
  })
  .meta({
    title: '長條圖設定',
    'ui:order': [
      'title',
      'subtitle',
      'seriesColumn',
      'valueColumn',
      'groupColumn',
      'labelColumn',
      'orientation',
      'axisLabel',
      'valueSuffix',
      'showLegend',
      'seriesColors',
      'annotations',
      'footnotes',
      'wide',
      'backdrop',
    ],
  })

export type BarChartConfig = z.infer<typeof barChartConfigSchema>

export type {
  BarChartAnnotation,
  BarChartBar,
  BarChartGroup,
  BarChartOrientation,
  BarChartProps,
} from '../shared/types.ts'
