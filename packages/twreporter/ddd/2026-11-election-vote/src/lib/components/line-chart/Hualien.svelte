<script lang="ts">
  import { lineChartOptions } from './options.ts'
  import LineChart from '@lab-reporter/ddd-shared/components/shared/LineChart.svelte'
  import type { ComponentProps } from '@lab-reporter/ddd-shared/components/types.ts'
  import { createQuery } from '@tanstack/svelte-query'
  import { secondBatch } from '../../batches/second.ts'
  import { historicalElectionTabs } from '../../election-historical-data.ts'
  import ElectionGraphic from '../../ElectionGraphic.svelte'
  const { config, ratio }: Pick<ComponentProps, 'config' | 'ratio'> = $props()
  const history = createQuery(
    () => historicalElectionTabs.hualienFuFamilyResults.options,
  )
  const rows = $derived([...(history.data ?? [])].sort((a, b) => a.年 - b.年))
  const data = $derived(
    rows.map((row) => {
      const rate = row['催票率（%）']
      return {
        series: '催票率',
        x: row.年,
        value: rate?.value ?? null,
        valueLabel: rate ? `${rate.text}%` : undefined,
      }
    }),
  )
</script>

<ElectionGraphic
  batch={secondBatch}
  {config}
  {ratio}
  graphicKey="8-hualien"
  error={history.error?.message}
  loading={history.isPending}
  empty={!data.some((point) => point.value !== null)}
>
  {#snippet children(entry)}
    <div class="chart-container">
      <LineChart
        {...lineChartOptions(entry)}
        yLabel="催票率（%）"
        {data}
        colors={{ 催票率: 'var(--elec-red)' }}
        xTickCount={6}
        formatValue={(value) => `${value}%`}
        valueTitle={(_series, year) =>
          rows.find((row) => row.年 === year)?.候選人}
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
