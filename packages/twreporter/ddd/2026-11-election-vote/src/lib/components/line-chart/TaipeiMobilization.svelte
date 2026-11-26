<script lang="ts">
  import { lineChartOptions } from './options.ts'
  import LineChart from '@lab-reporter/ddd-shared/components/shared/LineChart.svelte'
  import type { ComponentProps } from '@lab-reporter/ddd-shared/components/types.ts'
  import { createQuery } from '@tanstack/svelte-query'
  import { secondBatch } from '../../batches/second.ts'
  import { historicalElectionTabs } from '../../election-historical-data.ts'
  import ElectionGraphic from '../../ElectionGraphic.svelte'

  const {
    config,
    city = '63000',
  }: Pick<ComponentProps, 'config'> & { city?: string } = $props()
  const parties = [
    { name: '國民黨', column: '國民黨催票率（%）', color: 'var(--elec-kmt)' },
    { name: '民進黨', column: '民進黨催票率（%）', color: 'var(--elec-dpp)' },
    // {
    //   name: '無黨籍',
    //   column: '無黨籍催票率（%）',
    //   color: 'var(--elec-gray-3)',
    // },
    // { name: '新黨', column: '新黨催票率（%）', color: 'var(--elec-new)' },
  ] as const
  const colors = Object.fromEntries(
    parties.map((party) => [party.name, party.color]),
  )
  const history = createQuery(() => ({
    ...historicalElectionTabs.taipeiMayorMobilizationHistory.options,
    enabled: city === '63000',
  }))
  const data = $derived(
    (history.data ?? []).flatMap((row, index) =>
      parties.map((party) => ({
        series: party.name,
        x: index,
        value: row[party.column],
      })),
    ),
  )
</script>

<ElectionGraphic
  batch={secondBatch}
  {config}
  graphicKey="3-taipei-mobilization"
  error={city !== '63000'
    ? '此圖表僅提供台北市歷史資料。'
    : history.error?.message}
  loading={city === '63000' && history.isPending}
  empty={!data.length}
>
  {#snippet children(entry)}
    <div class="chart-container">
      <LineChart
        showAllXTicks
        {...lineChartOptions(entry)}
        yLabel="催票率（%）"
        {data}
        {colors}
        pointColor={(series, x) =>
          series === '民進黨' && history.data?.[x]?.台北市長屆次 === '2014'
            ? 'var(--elec-gray)'
            : undefined}
        lineSegmentStyle={(series, fromX, toX) =>
          series === '民進黨' &&
          [fromX, toX].some((x) => history.data?.[x]?.台北市長屆次 === '2014')
            ? { color: 'var(--elec-gray)', dasharray: '1 7' }
            : undefined}
        xTickCount={8}
        formatX={(value) => history.data?.[value]?.台北市長屆次 ?? ''}
        formatValue={(value) => `${value}%`}
      />
    </div>
  {/snippet}
</ElectionGraphic>

<style>
  .chart-container {
    height: var(--taipei-mobilization-height, auto);
    --line-chart-aspect-ratio: var(--taipei-mobilization-aspect-ratio, 4 / 3);
  }
</style>
