<script lang="ts">
  import LineChart from '@lab-reporter/ddd-shared/components/shared/LineChart.svelte'
  import type { ComponentProps } from '@lab-reporter/ddd-shared/components/types.ts'
  import { createQuery } from '@tanstack/svelte-query'
  import { secondBatch } from '../lib/batches/second.ts'
  import { historicalElectionTabs } from '../lib/election-historical-data.ts'
  import ElectionGraphic from '../lib/ElectionGraphic.svelte'

  const {
    config,
    taipei = false,
  }: Pick<ComponentProps, 'config'> & { taipei?: boolean } = $props()
  const cityHistory = createQuery(() => ({
    ...historicalElectionTabs.mayorTurnoutHistory.options,
    enabled: !taipei,
  }))
  const taipeiHistory = createQuery(() => ({
    ...historicalElectionTabs.taipeiMayorTurnoutHistory.options,
    enabled: taipei,
  }))
  const history = $derived(taipei ? taipeiHistory : cityHistory)
  const series = $derived(taipei ? '台北市長投票率' : '縣市長投票率')
  const rows = $derived(
    taipei
      ? (taipeiHistory.data ?? []).map((row) => ({
          label: row.屆次,
          value: row['台北市長投票率（%）'],
        }))
      : (cityHistory.data ?? []).map((row) => ({
          label: row.屆次,
          value: row['縣市長投票率（%）'],
        })),
  )
  const data = $derived(
    rows.map((row, index) => ({
      series,
      x: index,
      value: row.value,
    })),
  )
</script>

<ElectionGraphic
  batch={secondBatch}
  {config}
  graphicKey={taipei ? '2-taipei-turnout' : '1-city-turnout'}
  error={history.error?.message}
  loading={history.isPending}
  empty={!data.length}
>
  {#snippet children(entry)}
    <div class="chart-container">
      <LineChart
        label={entry.title}
        hoverFocusXAxis={entry.hoverFocusXAxis}
        hoverFocusYAxis={entry.hoverFocusYAxis}
        yLabel="投票率（%）"
        {data}
        colors={{ [series]: 'var(--elec-red)' }}
        chartBackdrop={false}
        showArea={entry.showArea}
        showTooltip={entry.showTooltip}
        showValue={entry.showValue}
        showXAxis={entry.showXAxis}
        showYAxis={entry.showYAxis}
        showXGrid={entry.showXGrid}
        gridHover={entry.gridHover}
        showYGrid={entry.showYGrid}
        showAllXTicks
        yLabelHorizontalTexts={entry.yLabelHorizontalTexts}
        connectGaps={entry.connectGaps}
        gapDasharray={entry.gapDasharray}
        lineWidth={entry.lineWidth}
        linePointRadius={entry.linePointRadius}
        yTickCount={entry.yTickCount}
        yDomain={[0, entry.yMax ?? 100]}
        formatX={(value) => rows[value]?.label ?? ''}
        formatValue={(value) => `${value}%`}
      />
    </div>
  {/snippet}
</ElectionGraphic>

<style>
  .chart-container {
    height: var(--city-turnout-height, auto);
    --line-chart-aspect-ratio: var(--city-turnout-aspect-ratio, 4 / 3);
  }
</style>
