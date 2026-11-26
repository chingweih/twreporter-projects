import type { ComponentProps } from 'svelte'
import type BarChart from '@lab-reporter/ddd-shared/components/shared/BarChart.svelte'
import type {
  ElectionBatchConfig,
  ElectionGraphicKey,
} from '../../batch-config.ts'

type Entry = NonNullable<ElectionBatchConfig[ElectionGraphicKey]>

export function barChartOptions(entry: Entry) {
  return {
    label: entry.title,
    hoverFocusXAxis: entry.hoverFocusXAxis,
    hoverFocusYAxis: entry.hoverFocusYAxis,
    barGap: entry.barGap,
    groupGap: entry.groupGap,
    showXAxis: entry.showXAxis,
    showValues: entry.showValues,
    showTotals: entry.showTotals,
    sortOrder: entry.sortOrder,
    sortBy: entry.sortBy,
    valueSeries: entry.valueSeries,
    valuePosition: entry.valuePosition,
    xAxisFontSize: entry.xAxisFontSize,
    yAxisFontSize: entry.yAxisFontSize,
    chartBackdrop: entry.chartBackdrop ?? false,
  } satisfies Partial<ComponentProps<typeof BarChart>>
}
