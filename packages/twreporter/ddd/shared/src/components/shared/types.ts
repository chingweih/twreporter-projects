import { z } from 'zod'

export const shellConfigSchema = z.object({
  title: z
    .string()
    .default('')
    .meta({ title: '標題', 'ui:widget': 'textarea' }),
  subtitle: z
    .string()
    .default('')
    .meta({ title: '副標題', 'ui:widget': 'textarea' }),
  footnotes: z
    .array(z.string().meta({ title: '註解', 'ui:widget': 'textarea' }))
    .default([])
    .meta({ title: '註解與資料來源' }),
  wide: z.boolean().default(false).meta({ title: '使用寬版版面' }),
  backdrop: z.boolean().default(true).meta({ title: '顯示底色' }),
})

export const chartColors = [
  {
    value: 'var(--chart-mint-5)',
    label: '薄荷深色',
  },
  {
    value: 'var(--chart-mint-4)',
    label: '薄荷中深色',
  },
  {
    value: 'var(--chart-mint-2)',
    label: '薄荷淺色',
  },
  {
    value: 'var(--chart-patina-4)',
    label: '銅綠中深色',
  },
  {
    value: 'var(--chart-indigo-2)',
    label: '靛紫淺色',
  },
  {
    value: 'var(--chart-indigo-4)',
    label: '靛紫中深色',
  },
  {
    value: 'var(--chart-earth-3)',
    label: '大地中色',
  },
  {
    value: 'var(--chart-earth-4)',
    label: '大地中深色',
  },
  {
    value: 'var(--chart-red-1)',
    label: '紅色最淺色',
  },
  {
    value: 'var(--chart-red-2)',
    label: '紅色淺色',
  },
  {
    value: 'var(--chart-red-4)',
    label: '紅色中深色',
  },
  {
    value: 'var(--chart-purple-2)',
    label: '紫色淺色',
  },
  {
    value: 'var(--chart-purple-4)',
    label: '紫色中深色',
  },
  {
    value: 'var(--chart-olive-3)',
    label: '橄欖中色',
  },
  {
    value: 'var(--chart-olive-4)',
    label: '橄欖中深色',
  },
  {
    value: 'var(--neutral-gray-300)',
    label: '灰色',
  },
] as const

export const colorSchema = z
  .enum(chartColors.map((color) => color.value))
  .meta({
    title: '顏色',
    'ui:enumNames': chartColors.map((color) => color.label),
  })
