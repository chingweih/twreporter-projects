<script lang="ts">
  import { barChartOptions } from './options.ts'
  import BarChart from '@lab-reporter/ddd-shared/components/shared/BarChart.svelte'
  import type { ComponentProps } from '@lab-reporter/ddd-shared/components/types.ts'
  import { createQuery } from '@tanstack/svelte-query'
  import { secondBatch } from '../../batches/second.ts'
  import { electionTabs } from '../../election-data.ts'
  import { historicalElectionTabs } from '../../election-historical-data.ts'
  import ElectionGraphic from '../../ElectionGraphic.svelte'

  const {
    config,
    ratio,
    kind,
  }: Pick<ComponentProps, 'config' | 'ratio'> & {
    kind: 'party' | 'age' | 'sex'
  } = $props()
  const parties = [
    { series: '國民黨', column: '國民黨席次', color: 'var(--elec-kmt)' },
    { series: '民眾黨', column: '民眾黨席次', color: 'var(--elec-tpp)' },
    { series: '無黨籍', column: '無黨籍席次', color: 'var(--elec-gray-2)' },
    { series: '其他', column: '其他席次', color: 'var(--elec-gray-3)' },
    { series: '民進黨', column: '民進黨席次', color: 'var(--elec-dpp)' },
  ] as const
  const ages = [
    {
      series: '未滿40歲',
      column: '未滿40歲（人）',
      color: 'var(--elec-red-2)',
    },
    {
      series: '40–49歲',
      column: '40–49歲（人）',
      color: 'var(--elec-red-3)',
    },
    {
      series: '50–59歲',
      column: '50–59歲（人）',
      color: 'var(--elec-red-4)',
    },
    {
      series: '60歲以上',
      column: '60歲以上（人）',
      color: 'var(--elec-red-5)',
    },
  ] as const
  const sexes = [
    { series: '女性', color: 'var(--chart-earth-3)' },
    { series: '男性', color: 'var(--chart-patina-3)' },
  ] as const
  const partyHistory = createQuery(() => ({
    ...historicalElectionTabs.councilPartySeats.options,
    enabled: kind === 'party',
  }))
  const ageHistory = createQuery(() => ({
    ...historicalElectionTabs.councilorAgeDistribution.options,
    enabled: kind === 'age',
  }))
  const sexHistory = createQuery(() => ({
    ...historicalElectionTabs.councilorGenderDistribution.options,
    enabled: kind === 'sex',
  }))
  const reservedSeatWinners = createQuery(() => ({
    ...electionTabs.councilors.options,
    enabled: kind === 'sex',
    select: (rows) =>
      rows.filter(
        (row) =>
          row.性別.trim() === '女' &&
          row.婦女保障當選.trim() === '婦女保障當選',
      ).length,
  }))
  const footnoteValues = $derived(
    reservedSeatWinners.data === undefined
      ? undefined
      : { women: String(reservedSeatWinners.data) },
  )
  const history = $derived(
    kind === 'party' ? partyHistory : kind === 'age' ? ageHistory : sexHistory,
  )
  const groups = $derived(
    kind === 'party'
      ? (partyHistory.data ?? []).map((row) => ({
          label: row.議會,
          emphasized: row.議會 === '全國合計',
          gapAfter: row.議會 === '全國合計' ? 8 : 0,
          bars: parties
            .map((party) => ({
              series: party.series,
              value: row[party.column],
              valueLabel: `${row[party.column]}`,
            }))
            .sort((a, b) => b.value - a.value),
        }))
      : kind === 'age'
        ? (ageHistory.data ?? []).map((row) => ({
            label: row.縣市,
            bars: ages.map((age) => ({
              series: age.series,
              value: row[age.column],
            })),
          }))
        : (sexHistory.data ?? []).map((row) => ({
            label: row.縣市,
            bars: sexes.map((sex) => ({
              series: sex.series,
              value: row[sex.series],
            })),
          })),
  )
  const colors = $derived(
    Object.fromEntries(
      (kind === 'party' ? parties : kind === 'age' ? ages : sexes).map(
        (item) => [item.series, item.color],
      ),
    ),
  )
  const graphicKey = $derived(
    kind === 'party'
      ? '4-city-council-party'
      : kind === 'age'
        ? '6-council-age'
        : '7-council-sex',
  )
</script>

<ElectionGraphic
  batch={secondBatch}
  {config}
  {ratio}
  {graphicKey}
  {footnoteValues}
  error={history.error?.message}
  loading={history.isPending}
  empty={!groups.length}
>
  {#snippet children(entry)}
    <div class="chart-container">
      <BarChart
        {...barChartOptions(entry)}
        valueTopN={kind === 'party' ? 3 : undefined}
        {groups}
        {colors}
        orientation="horizontal"
        annotations={kind === 'party' || kind === 'sex'
          ? [{ value: 50, label: '' }]
          : []}
        mode={entry.mode ?? 'stacked'}
        valueSuffix={kind === 'party' ? ' 席' : ' 人'}
      />
    </div>
  {/snippet}
</ElectionGraphic>

<style>
  .chart-container {
    height: var(--council-chart-height, auto);
    --bar-chart-aspect-ratio: var(--council-chart-aspect-ratio, 3 / 4);
  }
</style>
