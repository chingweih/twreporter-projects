<script lang="ts">
  import { createGraphic } from '../../utils/graphic-data.svelte.ts'
  import BarChart from '../shared/BarChart.svelte'
  import Shell from '../shared/Shell.svelte'
  import type { ComponentProps } from '../types.ts'
  import { parseBarChartCsv } from './data.ts'
  import { barChartConfigSchema } from './types.ts'

  const props: ComponentProps = $props()
  const graphic = createGraphic(
    'twreporter-bar-chart',
    barChartConfigSchema,
    () => props,
  )
  const config = $derived(graphic.config)
  const csv = $derived(graphic.csv)
  const data = $derived.by(() => {
    if (!csv || !config) return { groups: [] }
    try {
      return { groups: parseBarChartCsv(csv, config) }
    } catch (error) {
      return {
        groups: [],
        error: error instanceof Error ? error.message : '資料格式錯誤。',
      }
    }
  })
  const colors = $derived(
    Object.fromEntries(
      config?.seriesColors.map(({ series, color }) => [series, color]) ?? [],
    ),
  )
</script>

{#if config}
  <Shell
    bind:title={config.title}
    bind:subtitle={config.subtitle}
    bind:footnotes={config.footnotes}
    wide={config.wide}
    backdrop={config.backdrop}
    editable={graphic.editable}
    error={graphic.error ?? data.error}
    loading={graphic.loading && !csv}
    empty={!data.groups.length}
  >
    <BarChart
      label={config.title || '長條圖'}
      groups={data.groups}
      orientation={config.orientation}
      mode={config.mode}
      chartBackdrop={config.chartBackdrop}
      barGap={config.barGap}
      groupGap={config.groupGap}
      showXAxis={config.showXAxis}
      hoverFocusXAxis={config.hoverFocusXAxis}
      hoverFocusYAxis={config.hoverFocusYAxis}
      showValues={config.showValues}
      showTotals={config.showTotals}
      valuePosition={config.valuePosition}
      xAxisFontSize={config.xAxisFontSize}
      yAxisFontSize={config.yAxisFontSize}
      showLegend={config.showLegend}
      axisLabel={config.axisLabel}
      annotations={config.annotations}
      {colors}
      valueSuffix={config.valueSuffix}
    />
  </Shell>
{:else}
  <Shell error={graphic.error} loading={graphic.loading} empty />
{/if}
