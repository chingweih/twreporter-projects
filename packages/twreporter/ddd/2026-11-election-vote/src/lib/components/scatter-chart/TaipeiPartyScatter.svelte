<script lang="ts">
  import ScatterChart from '@lab-reporter/ddd-shared/components/shared/ScatterChart.svelte'
  import type { ComponentProps } from '@lab-reporter/ddd-shared/components/types.ts'
  import { createQuery } from '@tanstack/svelte-query'
  import { secondBatch } from '../../batches/second.ts'
  import { electionTabs } from '../../election-data.ts'
  import { historicalElectionTabs } from '../../election-historical-data.ts'
  import ElectionGraphic from '../../ElectionGraphic.svelte'

  const { config }: Pick<ComponentProps, 'config'> = $props()
  const historical = createQuery(
    () => historicalElectionTabs.taipeiMayorByVillage.options,
  )
  const current = createQuery(() => electionTabs.mayorByVillage.options)
  const panels = [
    {
      name: '沈伯洋',
      previous: '陳時中',
      camp: '綠營',
      color: 'var(--elec-dpp)',
    },
    {
      name: '蔣萬安',
      previous: '蔣萬安',
      camp: '藍營',
      color: 'var(--elec-kmt)',
    },
  ]
  const baseline = $derived(
    new Map(
      (historical.data ?? [])
        .filter((row) => row.選舉 === 2022 && row.選舉人數 > 0)
        .map((row) => [
          `${row.villagecode}:${row.姓名}`,
          (row.得票數 / row.選舉人數) * 100,
        ]),
    ),
  )
  const charts = $derived(
    panels.map((panel) => ({
      ...panel,
      data: (current.data ?? [])
        .filter(
          (row) =>
            row.縣市代碼 === '63000' &&
            row.姓名 === panel.name &&
            row.選舉人數 > 0,
        )
        .flatMap((row) => {
          const previous = baseline.get(`${row.村里代碼}:${panel.previous}`)
          const huang = baseline.get(`${row.村里代碼}:黃珊珊`)
          if (previous === undefined || huang === undefined) return []
          return [
            {
              series: panel.name,
              label: `${row.鄉鎮市區} ${row.村里} · ${panel.name}`,
              x: (row.得票數 / row.選舉人數) * 100 - previous,
              y: huang,
            },
          ]
        }),
    })),
  )
  const xMinimum = $derived(
    Math.floor(
      Math.min(
        0,
        ...charts.flatMap((chart) => chart.data.map((point) => point.x)),
      ) / 5,
    ) * 5,
  )
</script>

<ElectionGraphic
  batch={secondBatch}
  {config}
  graphicKey="13-taipei-party-scatter"
  error={historical.error?.message ?? current.error?.message}
  loading={historical.isPending || current.isPending}
  empty={!charts.some((chart) => chart.data.length)}
>
  {#snippet children(entry)}
    <div class="panels">
      {#each charts as chart}
        <section aria-label={chart.name}>
          <ScatterChart
            label={`${entry.title}：${chart.name}`}
            data={chart.data}
            colors={{ [chart.name]: chart.color }}
            showLegend={false}
            chartBackdrop={entry.chartBackdrop}
            showTooltip={entry.showTooltip}
            showXAxis={entry.showXAxis}
            showYAxis={entry.showYAxis}
            showXGrid={entry.showXGrid}
            showYGrid={entry.showYGrid}
            hoverFocusXAxis={entry.hoverFocusXAxis}
            hoverFocusYAxis={entry.hoverFocusYAxis}
            pointRadius={entry.pointRadius}
            xTickCount={entry.xTickCount}
            yLabelHorizontalTexts={entry.yLabelHorizontalTexts}
            yTickCount={entry.yTickCount}
            xDomain={[entry.xMin ?? xMinimum, entry.xMax ?? 40]}
            yDomain={[0, entry.yMax ?? 40]}
            showTrendLine={entry.showTrendLine}
            xLabel={`2022與2026${chart.camp}各地催票率差異（百分點）`}
            yLabel="2022黃珊珊各地催票率（%）"
            formatX={(value) => String(Number(value.toFixed(2)))}
            formatY={(value) => `${Number(value.toFixed(2))}%`}
          />
        </section>
      {/each}
    </div>
  {/snippet}
</ElectionGraphic>

<style>
  .panels {
    display: flex;
    flex-direction: column;
    gap: 24px;
    min-height: 0;
  }
  section {
    display: flex;
    flex-direction: column;
    min-height: 0;
    flex: 1;
  }
</style>
