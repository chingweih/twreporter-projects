<script lang="ts">
  import BarChart from '@lab-reporter/ddd-shared/components/shared/BarChart.svelte'
  import type { ComponentProps } from '@lab-reporter/ddd-shared/components/types.ts'
  import { createQuery } from '@tanstack/svelte-query'
  import { firstBatch } from '../lib/batches/first.ts'
  import { electionTabs } from '../lib/election-data.ts'
  import { historicalElectionTabs } from '../lib/election-historical-data.ts'
  import ElectionGraphic from '../lib/ElectionGraphic.svelte'

  const { config }: Pick<ComponentProps, 'config'> = $props()
  const percentage = (value: number) =>
    `${value.toLocaleString('zh-TW', { maximumFractionDigits: 1 })}%`
  const results = createQuery(() => ({
    ...electionTabs.referendum.options,
    select: (rows) => rows.filter((row) => row.層級.trim() === '全國'),
  }))
  const history = createQuery(
    () => historicalElectionTabs.referendumResults.options,
  )
  const groups = $derived(
    [
      ...(results.data ?? []).map((row) => ({
        label: '2026 廢除非核家園',
        electorate: row.投票權人數,
        agree: row.同意票,
        disagree: row.不同意票,
      })),
      ...(history.data ?? []).flatMap((row) =>
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
      ),
    ]
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
  graphicKey="4-ref-result"
  error={results.error?.message ?? history.error?.message}
  loading={results.isPending || history.isPending}
  empty={!groups.length}
>
  {#snippet children(entry)}
    <BarChart
      label={entry.title}
      hoverFocusXAxis={entry.hoverFocusXAxis}
      hoverFocusYAxis={entry.hoverFocusYAxis}
      {groups}
      {colors}
      mode={entry.mode ?? 'grouped'}
      chartBackdrop={entry.chartBackdrop ?? false}
      barGap={entry.barGap ?? 4}
      groupGap={entry.groupGap ?? 10}
      showXAxis={entry.showXAxis ?? true}
      showValues={entry.showValues ?? true}
      showTotals={entry.showTotals ?? false}
      sortOrder={entry.sortOrder}
      sortBy={entry.sortBy}
      valueSeries={entry.valueSeries}
      valuePosition={entry.valuePosition}
      xAxisFontSize={entry.xAxisFontSize}
      yAxisFontSize={entry.yAxisFontSize}
      orientation="horizontal"
      axisLabel="占投票權人比例（%）"
      annotations={[{ value: 25, label: '門檻：投票權人的 25%' }]}
      formatValue={(value) =>
        `${value.toLocaleString('zh-TW', { maximumFractionDigits: 1 })}%`}
    />
  {/snippet}
</ElectionGraphic>
