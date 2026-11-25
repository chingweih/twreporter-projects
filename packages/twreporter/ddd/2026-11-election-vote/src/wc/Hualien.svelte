<script lang="ts">
  import LineChart from '@lab-reporter/ddd-shared/components/shared/LineChart.svelte'
  import type { ComponentProps } from '@lab-reporter/ddd-shared/components/types.ts'
  import { createQuery } from '@tanstack/svelte-query'
  import { secondBatch } from '../lib/batches/second.ts'
  import { historicalElectionTabs } from '../lib/election-historical-data.ts'
  import ElectionGraphic from '../lib/ElectionGraphic.svelte'
  const { config }: Pick<ComponentProps, 'config'> = $props()
  const history = createQuery(
    () => historicalElectionTabs.hualienFuFamilyResults.options,
  )
  const rows = $derived([...(history.data ?? [])].sort((a, b) => a.年 - b.年))
  const data = $derived(
    rows.map((row) => ({
      series: '傅家得票率',
      x: row.年,
      value: row['得票率（%）'],
    })),
  )
</script>

<ElectionGraphic
  batch={secondBatch}
  {config}
  graphicKey="8-hualien"
  error={history.error?.message}
  loading={history.isPending}
  empty={!data.some((point) => point.value !== null)}
>
  {#snippet children(entry)}
    <div class="chart-container">
      <LineChart
        label={entry.title}
        yLabel="得票率（%）"
        {data}
        colors={{ 傅家得票率: 'var(--elec-kmt)' }}
        chartBackdrop={false}
        showArea={entry.showArea}
        showTooltip={entry.showTooltip}
        showValue={entry.showValue}
        showXAxis={entry.showXAxis}
        showYAxis={entry.showYAxis}
        showXGrid={entry.showXGrid}
        showYGrid={entry.showYGrid}
        gridHover={entry.gridHover}
        xTickCount={6}
        yTickCount={entry.yTickCount}
        yDomain={[0, entry.yMax ?? 100]}
        formatValue={(value) => `${value}%`}
      />
    </div>
  {/snippet}
</ElectionGraphic>

<style>
  .chart-container {
    height: var(--hualien-height, auto);
    --line-chart-aspect-ratio: var(--hualien-aspect-ratio, 4 / 3);
  }
</style>
