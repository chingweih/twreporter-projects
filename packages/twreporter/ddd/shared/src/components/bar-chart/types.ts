import { z } from 'zod'
import defaults from '../../../public/bar-chart/defaults.json' with { type: 'json' }
import {
  barChartAnnotationSchema,
  barChartBackdropSchema,
  barChartGapSchema,
  barChartGroupGapSchema,
  barChartXAxisSchema,
  barChartShowValuesSchema,
  barChartShowTotalsSchema,
  barChartValuePositionSchema,
  barChartAxisFontSizeSchema,
  barChartModeSchema,
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
    mode: barChartModeSchema
      .default(barChartModeSchema.parse(defaults.mode))
      .meta({
        title: '呈現方式',
        'ui:enumNames': ['一般／分組', '堆疊', '百分比堆疊'],
      }),
    orientation: barChartOrientationSchema
      .default(barChartOrientationSchema.parse(defaults.orientation))
      .meta({ title: '方向', 'ui:enumNames': ['直向', '橫向'] }),
    showLegend: z.boolean().default(defaults.showLegend).meta({
      title: '顯示圖例',
    }),
    chartBackdrop: barChartBackdropSchema.default(defaults.chartBackdrop),
    barGap: barChartGapSchema.default(defaults.barGap),
    groupGap: barChartGroupGapSchema.default(defaults.groupGap),
    showXAxis: barChartXAxisSchema.default(defaults.showXAxis),
    showValues: barChartShowValuesSchema.default(defaults.showValues),
    showTotals: barChartShowTotalsSchema.default(defaults.showTotals),
    valuePosition: barChartValuePositionSchema,
    valueLabels: z
      .array(
        z
          .object({
            column: z.string().trim().min(1).meta({
              title: '資料欄位',
              description: '直接使用該欄文字，單位與格式由資料提供。',
            }),
            position: z.enum(['left', 'center', 'outside']).meta({
              title: '位置',
              'ui:enumNames': ['靠左', '置中', '外側'],
            }),
          })
          .meta({ 'ui:order': ['column', 'position'] }),
      )
      .max(2)
      .optional()
      .meta({
        title: '自訂數值標籤',
        description:
          '最多兩個；留空沿用數值欄位與數值位置。請選不同位置以避免重疊。',
        'ui:options': { titleKey: 'column', collapsible: true },
      }),
    xAxisFontSize: barChartAxisFontSizeSchema.meta({
      title: 'X 軸字級（px）',
      description: '留空沿用 responsive theme 字級。',
    }),
    yAxisFontSize: barChartAxisFontSizeSchema.meta({
      title: 'Y 軸字級（px）',
      description: '留空沿用 responsive theme 字級。',
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
      'mode',
      'axisLabel',
      'valueSuffix',
      'showLegend',
      'chartBackdrop',
      'barGap',
      'groupGap',
      'showXAxis',
      'showValues',
      'showTotals',
      'valuePosition',
      'valueLabels',
      'xAxisFontSize',
      'yAxisFontSize',
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
