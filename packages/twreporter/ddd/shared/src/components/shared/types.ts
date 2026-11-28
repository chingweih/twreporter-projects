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
  ratio: z.number().positive().optional().meta({
    title: '固定長寬比（寬 ÷ 高）',
    description: '以 700px 寬排版，再縮放至可用寬度。留空則使用響應式版面。',
  }),
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
    ratio:
      defaults.ratio === undefined
        ? shellConfigFields.ratio
        : shellConfigFields.ratio.default(defaults.ratio),
  })
}

export const colorSchema = z
  .string()
  .regex(/^#[0-9a-fA-F]{6}$/)
  .meta({ title: '顏色', 'ui:widget': 'color' })

export type Color = z.infer<typeof colorSchema>

export const lineChartTooltipLabelTemplateSchema = z
  .string()
  .trim()
  .min(1)
  .meta({
    title: 'Tooltip 標籤格式',
    description: '輸入 {{name}} 帶入原本的標籤。',
  })

export const lineChartShowTooltipValueSchema = z
  .boolean()
  .meta({ title: '顯示 Tooltip 數值' })

export const barChartModeSchema = z.enum([
  'grouped',
  'stacked',
  'stacked-percent',
])
export type BarChartMode = z.infer<typeof barChartModeSchema>
export const barChartGroupGapSchema = z.number().nonnegative().meta({
  title: '組間距（px）',
  description: '一般／分組圖各組之間的額外間距；堆疊圖不使用此設定。',
})
export const barChartValuePositionSchema = z
  .enum(['left', 'center', 'outside'])
  .optional()
  .meta({
    title: '數值位置',
    'ui:enumNames': ['靠左', '置中', '外側'],
    description: '留空時，堆疊圖置中，一般／分組圖放在外側。',
  })
export const barChartShowValuesSchema = z
  .boolean()
  .meta({ title: '顯示長條數值' })
export const barChartShowTotalsSchema = z
  .boolean()
  .meta({ title: '顯示堆疊總值' })
export const barChartAxisFontSizeSchema = z.number().min(8).max(48).optional()
export const barChartXAxisSchema = z.boolean().meta({ title: '顯示 X 軸' })
export const barChartGapSchema = z.number().nonnegative().meta({
  title: '長條間距（px）',
  description: '長條之間的像素間距；堆疊圖調整各組間距。空間不足時會縮小間距。',
})
export const barChartBackdropSchema = z.boolean().meta({
  title: '圖表底色與內距',
  description: '關閉後，移除圖表區域的背景色與 padding。',
})
export const barChartOrientationSchema = z.enum(['vertical', 'horizontal'])
export const barChartAnnotationSchema = z
  .object({
    value: z.number().meta({ title: '數值' }),
    label: z.string().trim().min(1).meta({ title: '標籤' }),
  })
  .meta({ 'ui:order': ['value', 'label'] })

export type BarChartOrientation = z.infer<typeof barChartOrientationSchema>
export type BarChartAnnotation = z.infer<typeof barChartAnnotationSchema>

export type BarChartBar = {
  axisValue?: number
  series: string
  value: number
  valueLabel?: string
  outsideValueLabel?: string
  valueLabels?: readonly {
    text: string
    position: 'left' | 'center' | 'outside'
  }[]
  label?: string
}

export type BarChartGroup = {
  label?: string
  emphasized?: boolean
  gapAfter?: number
  separatorAfter?: boolean
  bars: readonly BarChartBar[]
}

export type BarChartProps = {
  sortOrder?: 'original' | 'ascending' | 'descending'
  sortBy?: string
  hoverFocusXAxis?: boolean
  hoverFocusYAxis?: boolean
  showXGrid?: boolean
  showTooltip?: boolean
  xAxisPosition?: 'top' | 'bottom'
  valueTicks?: readonly { value: number; label: string }[]
  label: string
  groups: readonly BarChartGroup[]
  orientation?: BarChartOrientation
  mode?: BarChartMode
  chartBackdrop?: boolean
  barGap?: number
  groupGap?: number
  showXAxis?: boolean
  showValues?: boolean
  valueSeries?: readonly string[]
  valueTopN?: number
  showTotals?: boolean
  valuePosition?: 'left' | 'center' | 'outside'
  xAxisFontSize?: number
  yAxisFontSize?: number
  mobileXTickCount?: number
  mobileYTickCount?: number
  showLegend?: boolean
  axisLabel?: string
  colors?: Readonly<Record<string, string>>
  annotations?: readonly BarChartAnnotation[]
  valueSuffix?: string
  formatValue?: (value: number) => string
}
