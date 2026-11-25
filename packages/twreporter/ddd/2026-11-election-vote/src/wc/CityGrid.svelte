<script lang="ts">
  import BarChart from '@lab-reporter/ddd-shared/components/shared/BarChart.svelte'
  import type { ComponentProps } from '@lab-reporter/ddd-shared/components/types.ts'
  import { createQuery } from '@tanstack/svelte-query'
  import { firstBatch } from '../lib/batches/first.ts'
  import { historicalElectionTabs } from '../lib/election-historical-data.ts'
  import ElectionGraphic from '../lib/ElectionGraphic.svelte'

  const { config }: Pick<ComponentProps, 'config'> = $props()
  const history = createQuery(
    () => historicalElectionTabs.mayorPartyHistory.options,
  )
  const colors = {
    國民黨: 'var(--elec-kmt)',
    民進黨: 'var(--elec-dpp)',
    民眾黨: 'var(--elec-tpp)',
    親民黨: 'var(--elec-pfp)',
    新黨: 'var(--elec-new)',
    無黨籍: 'var(--elec-gray-3)',
    未有資料: 'var(--neutral-gray-100)',
  }
  const years = $derived(
    [...new Set((history.data ?? []).map((row) => row.屆次))].sort(),
  )
  const groups = $derived(
    [...new Set((history.data ?? []).map((row) => row.縣市))].map((city) => ({
      label: city,
      bars: years.map((year, index) => {
        const row = history.data?.find(
          (row) => row.縣市 === city && row.屆次 === year,
        )
        return {
          series: row?.政黨 || '未有資料',
          value: 1,
          axisValue: ((index + 0.5) / years.length) * 100,
          label: `${year} · ${row?.當選人 || '未有資料'}`,
          valueLabel: row?.當選人 || '—',
        }
      }),
    })),
  )
</script>

<ElectionGraphic
  batch={firstBatch}
  {config}
  graphicKey="2-city-grid"
  error={history.error?.message}
  loading={history.isPending}
  empty={!groups.length}
>
  {#snippet children(entry)}
    <div class="chart-container">
      <BarChart
        label={entry.title}
        hoverFocusXAxis={entry.hoverFocusXAxis}
        hoverFocusYAxis={entry.hoverFocusYAxis}
        {groups}
        {colors}
        showTooltip={entry.showTooltip}
        showXGrid={entry.showXGrid}
        valueTicks={years.map((year, index) => ({
          value: ((index + 0.5) / years.length) * 100,
          label: year,
        }))}
        orientation="horizontal"
        xAxisPosition="top"
        mode={entry.mode ?? 'stacked-percent'}
        chartBackdrop={entry.chartBackdrop ?? false}
        barGap={entry.barGap}
        groupGap={entry.groupGap}
        showXAxis={entry.showXAxis ?? true}
        showValues={entry.showValues}
        showTotals={entry.showTotals ?? false}
        valuePosition={entry.valuePosition ?? 'center'}
        xAxisFontSize={entry.xAxisFontSize}
        yAxisFontSize={entry.yAxisFontSize}
        formatValue={() => ''}
      />
    </div>
  {/snippet}
</ElectionGraphic>

<style>
  .chart-container {
    height: var(--city-grid-height, auto);
    --bar-chart-aspect-ratio: var(--city-grid-aspect-ratio, 3 / 4);
  }
</style>
