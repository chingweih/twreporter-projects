<script lang="ts">
  import BarChart from '@lab-reporter/ddd-shared/components/shared/BarChart.svelte'
  import type { ComponentProps } from '@lab-reporter/ddd-shared/components/types.ts'
  import { createQuery } from '@tanstack/svelte-query'
  import { firstBatch } from '../lib/batches/first.ts'
  import { historicalElectionTabs } from '../lib/election-historical-data.ts'
  import ElectionGraphic from '../lib/ElectionGraphic.svelte'

  const { config }: Pick<ComponentProps, 'config'> = $props()
  const parties = [
    { name: '國民黨', color: '--elec-kmt' },
    { name: '民進黨', color: '--elec-dpp' },
    { name: '民眾黨', color: '--elec-tpp' },
    { name: '親民黨', color: '--elec-pfp' },
    { name: '新黨', color: '--elec-new' },
    { name: '無黨籍', color: '--elec-gray-2' },
  ] as const
  const colors = Object.fromEntries(
    parties.map(({ name, color }) => [name, `var(${color})`]),
  )
  const history = createQuery(
    () => historicalElectionTabs.mayorPartySeatHistory.options,
  )
  const groups = $derived(
    (history.data ?? []).map((row) => ({
      label: row.屆次,
      bars: parties.map(({ name }) => ({ series: name, value: row[name] })),
    })),
  )
</script>

<ElectionGraphic
  batch={firstBatch}
  {config}
  graphicKey="3-party-city-result"
  error={history.error?.message}
  loading={history.isPending}
  empty={!groups.length}
>
  {#snippet children(entry)}
    <div class="chart-container">
      <BarChart
        label={entry.title}
        {groups}
        {colors}
        mode={entry.mode ?? 'stacked'}
        chartBackdrop={entry.chartBackdrop ?? false}
        barGap={entry.barGap ?? 4}
        groupGap={entry.groupGap ?? 10}
        showXAxis={entry.showXAxis ?? false}
        showValues={entry.showValues ?? true}
        showTotals={entry.showTotals ?? true}
        valuePosition={entry.valuePosition}
        xAxisFontSize={entry.xAxisFontSize}
        yAxisFontSize={entry.yAxisFontSize}
        orientation="horizontal"
        // valueSuffix=" 席"
      />
    </div>
  {/snippet}
</ElectionGraphic>

<style>
  .chart-container {
    height: var(--party-city-result-height, auto);
    --bar-chart-aspect-ratio: var(--party-city-result-aspect-ratio, 4 / 3);
  }
</style>
