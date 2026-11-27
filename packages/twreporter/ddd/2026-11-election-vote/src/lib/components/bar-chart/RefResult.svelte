<script lang="ts">
  import { barChartOptions } from './options.ts'
  import BarChart from '@lab-reporter/ddd-shared/components/shared/BarChart.svelte'
  import type { ComponentProps } from '@lab-reporter/ddd-shared/components/types.ts'
  import { createQuery } from '@tanstack/svelte-query'
  import { firstBatch } from '../../batches/first.ts'
  import { historicalElectionTabs } from '../../election-historical-data.ts'
  import ElectionGraphic from '../../ElectionGraphic.svelte'

  const { config, ratio }: Pick<ComponentProps, 'config' | 'ratio'> = $props()
  const percentage = (value: number) =>
    `${value.toLocaleString('zh-TW', { maximumFractionDigits: 1 })}%`
  const history = createQuery(
    () => historicalElectionTabs.referendumResults.options,
  )
  const groups = $derived(
    (history.data ?? [])
      .flatMap((row) =>
        row.投票權人 === null || row.同意票 === null || row.不同意票 === null
          ? []
          : [
              {
                label: row.案次,
                electorate: row.投票權人,
                agree: row.同意票,
                disagree: row.不同意票,
              },
            ],
      )
      .filter((row) => row.electorate > 0)
      .map((row) => ({
        label: row.label.replace(/^(\d{4})\s+/, '$1年\n'),
        bars: [
          {
            series: '同意票',
            value: (row.agree / row.electorate) * 100,
            valueLabel: `${row.agree.toLocaleString('zh-TW')} 票`,
            outsideValueLabel: percentage((row.agree / row.electorate) * 100),
          },
          {
            series: '不同意票',
            value: (row.disagree / row.electorate) * 100,
            valueLabel: `${row.disagree.toLocaleString('zh-TW')} 票`,
            outsideValueLabel: percentage(
              (row.disagree / row.electorate) * 100,
            ),
          },
        ],
      })),
  )
  const colors = { 同意票: 'var(--elec-red)', 不同意票: 'var(--elec-gray)' }
</script>

<ElectionGraphic
  batch={firstBatch}
  {config}
  {ratio}
  graphicKey="4-ref-result"
  error={history.error?.message}
  loading={history.isPending}
  empty={!groups.length}
>
  {#snippet children(entry)}
    <BarChart
      {...barChartOptions(entry)}
      {groups}
      {colors}
      mode={entry.mode ?? 'grouped'}
      barGap={entry.barGap ?? 4}
      groupGap={entry.groupGap ?? 10}
      showXAxis={entry.showXAxis ?? true}
      showValues={entry.showValues ?? true}
      showTotals={entry.showTotals ?? false}
      orientation="horizontal"
      axisLabel="占投票權人比例（%）"
      annotations={[{ value: 25, label: '投票權人的 25%' }]}
      formatValue={(value) =>
        `${value.toLocaleString('zh-TW', { maximumFractionDigits: 1 })}%`}
    />
  {/snippet}
</ElectionGraphic>
