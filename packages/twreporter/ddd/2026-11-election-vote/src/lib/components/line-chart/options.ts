import type { ComponentProps } from 'svelte'
import type LineChart from '@lab-reporter/ddd-shared/components/shared/LineChart.svelte'
import type {
  ElectionBatchConfig,
  ElectionGraphicKey,
} from '../../batch-config.ts'

type Entry = NonNullable<ElectionBatchConfig[ElectionGraphicKey]>

export function lineChartOptions(entry: Entry) {
  return {
    label: entry.title,
    hoverFocusXAxis: entry.hoverFocusXAxis,
    hoverFocusYAxis: entry.hoverFocusYAxis,
    showArea: entry.showArea,
    showTooltip: entry.showTooltip,
    showValue: entry.showValue,
    showXAxis: entry.showXAxis,
    showYAxis: entry.showYAxis,
    showXGrid: entry.showXGrid,
    showYGrid: entry.showYGrid,
    gridHover: entry.gridHover,
    yLabelHorizontalTexts: entry.yLabelHorizontalTexts,
    connectGaps: entry.connectGaps,
    gapDasharray: entry.gapDasharray,
    lineWidth: entry.lineWidth,
    linePointRadius: entry.linePointRadius,
    yTickCount: entry.yTickCount,
    mobileXTickCount: entry.mobileXTickCount,
    mobileYTickCount: entry.mobileYTickCount,
    chartBackdrop: false,
    yDomain: [0, entry.yMax ?? 100],
  } satisfies Partial<ComponentProps<typeof LineChart>>
}
