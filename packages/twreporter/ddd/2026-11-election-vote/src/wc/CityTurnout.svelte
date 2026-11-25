<script lang="ts">
  import LineChart from '@lab-reporter/ddd-shared/components/shared/LineChart.svelte'
  import type { ComponentProps } from '@lab-reporter/ddd-shared/components/types.ts'
  import { createQuery } from '@tanstack/svelte-query'
  import { secondBatch } from '../lib/batches/second.ts'
  import { historicalElectionTabs } from '../lib/election-historical-data.ts'
  import ElectionGraphic from '../lib/ElectionGraphic.svelte'

  const { config }: Pick<ComponentProps, 'config'> = $props()
  const history = createQuery(
    () => historicalElectionTabs.mayorTurnoutHistory.options,
  )
  const data = $derived(
    (history.data ?? []).map((row, index) => ({
      series: '縣市長投票率',
      x: index,
      value: row['縣市長投票率（%）'],
    })),
  )
</script>

<ElectionGraphic
  batch={secondBatch}
  {config}
  graphicKey="1-city-turnout"
  error={history.error?.message}
  loading={history.isPending}
  empty={!data.length}
>
  {#snippet children(entry)}
    <div class="chart-container">
      <LineChart
        label={entry.title}
        yLabel="投票率（%）"
        {data}
        colors={{ 縣市長投票率: 'var(--elec-red)' }}
        chartBackdrop={false}
        showArea={entry.showArea}
        showValue={entry.showValue}
        showXAxis={entry.showXAxis}
        showYAxis={entry.showYAxis}
        showXGrid={entry.showXGrid}
        showYGrid={entry.showYGrid}
        xTickCount={8}
        yTickCount={entry.yTickCount}
        yDomain={[0, entry.yMax ?? 100]}
        formatX={(value) => history.data?.[value]?.屆次 ?? ''}
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
