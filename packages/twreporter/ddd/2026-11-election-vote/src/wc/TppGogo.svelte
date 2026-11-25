<script lang="ts">
  import Legend from '@lab-reporter/ddd-shared/components/shared/Legend.svelte'
  import Tooltip from '@lab-reporter/ddd-shared/components/shared/Tooltip.svelte'
  import TooltipRows from '@lab-reporter/ddd-shared/components/shared/TooltipRows.svelte'
  import type { ComponentProps } from '@lab-reporter/ddd-shared/components/types.ts'
  import { createQuery } from '@tanstack/svelte-query'
  import { secondBatch } from '../lib/batches/second.ts'
  import { historicalElectionTabs } from '../lib/election-historical-data.ts'
  import ElectionGraphic from '../lib/ElectionGraphic.svelte'

  const { config }: Pick<ComponentProps, 'config'> = $props()
  const nominations = createQuery(
    () => historicalElectionTabs.councilNominations.options,
  )
  const parties = [
    { label: '民眾黨', color: 'var(--elec-tpp)' },
    { label: '時代力量', color: 'var(--chart-olive-3)' },
    { label: '小民參政歐巴桑聯盟', color: 'var(--elec-gogo)' },
    { label: '台灣基進', color: 'var(--elec-red)' },
    { label: '台灣綠黨', color: 'var(--elec-dpp)' },
  ]
  let active = $state<string>()
  const sections = $derived(
    ['民眾黨', '台灣前進成員合計'].map((title, sectionIndex) => ({
      title,
      years: ([2018, 2022, 2026] as const).map((year) => {
        const bars = parties
          .filter((_, index) => (sectionIndex === 0 ? index === 0 : index > 0))
          .map((party) => {
            const rows = (nominations.data ?? []).filter(
              (row) =>
                row.政黨 === party.label &&
                (sectionIndex === 0 || row['2026 所屬聯盟'] === '台灣前進'),
            )
            const available = rows.some(
              (row) => year === 2026 || row[`${year} 提名`] !== null,
            )
            const total = rows.reduce(
              (sum, row) =>
                sum +
                (year === 2026 ? row['2026 登記'] : (row[`${year} 提名`] ?? 0)),
              0,
            )
            const elected =
              year === 2026
                ? null
                : rows.reduce((sum, row) => sum + (row[`${year} 當選`] ?? 0), 0)
            return { ...party, total, elected, available }
          })
        return {
          year,
          bars,
          total: bars.reduce((sum, bar) => sum + bar.total, 0),
          elected: bars.reduce((sum, bar) => sum + (bar.elected ?? 0), 0),
          available: bars.some((bar) => bar.available),
        }
      }),
    })),
  )
  const maxTotal = $derived(
    Math.max(
      1,
      ...sections.flatMap((section) => section.years.map((row) => row.total)),
    ),
  )
</script>

<ElectionGraphic
  batch={secondBatch}
  {config}
  graphicKey="5-tpp-gogo"
  error={nominations.error?.message}
  loading={nominations.isPending}
  empty={!nominations.data?.length}
>
  {#snippet children(entry)}
    <div class="chart" class:backdrop={entry.chartBackdrop}>
      <Legend items={parties} {active} onhover={(label) => (active = label)} />
      <p class="encoding">
        外框：提名人數　實色：當選人數　斜線：2026 登記人數
      </p>
      {#each sections as section}
        <section aria-label={section.title}>
          <h3>{section.title}</h3>
          {#if section.title !== '民眾黨'}<p class="note">
              依 2026 聯盟成員回溯加總；2018、2022 各黨分別參選。
            </p>{/if}
          {#each section.years as row}
            <div class="year-row">
              <span class="year">{row.year}</span>
              <div>
                {#if row.available}
                  <div
                    class="bars"
                    style:width={`${entry.mode === 'stacked-percent' ? 100 : (row.total / maxTotal) * 100}%`}
                    style:gap={`${entry.barGap ?? 4}px`}
                  >
                    {#each row.bars.filter((bar) => bar.total > 0) as bar}
                      <div
                        class="segment"
                        style:flex-grow={bar.total}
                        style:flex-basis="0"
                        style:opacity={active && active !== bar.label
                          ? 0.25
                          : 1}
                        onpointerenter={() => (active = bar.label)}
                        onpointerleave={() => (active = undefined)}
                        role="group"
                        aria-label={bar.label}
                      >
                        <Tooltip title={`${row.year} · ${bar.label}`}>
                          {#snippet children()}
                            <button
                              type="button"
                              class="bar"
                              class:pending={row.year === 2026}
                              style:--party-color={bar.color}
                              aria-label={row.year === 2026
                                ? `登記 ${bar.total} 人`
                                : `提名 ${bar.total} 人，當選 ${bar.elected} 人`}
                            >
                              {#if bar.elected !== null}<div
                                  class="elected"
                                  style:width={`${(bar.elected / bar.total) * 100}%`}
                                ></div>{/if}
                            </button>
                          {/snippet}
                          {#snippet content()}
                            <TooltipRows
                              rows={row.year === 2026
                                ? [
                                    {
                                      label: '登記',
                                      value: `${bar.total} 人`,
                                      color: bar.color,
                                    },
                                  ]
                                : [
                                    {
                                      label: '提名',
                                      value: `${bar.total} 人`,
                                      color: bar.color,
                                    },
                                    {
                                      label: '當選',
                                      value: `${bar.elected} 人`,
                                      color: bar.color,
                                    },
                                  ]}
                            />
                          {/snippet}
                        </Tooltip>
                      </div>
                    {/each}
                  </div>
                  {#if entry.showValues || entry.showTotals}<p class="summary">
                      {row.year === 2026
                        ? `登記 ${row.total} 人，尚無當選資料`
                        : `提名 ${row.total} 人 · 當選 ${row.elected} 人`}
                    </p>{/if}
                {:else}
                  <p class="note">2019 年成立，未參與 2018 選舉。</p>
                {/if}
              </div>
            </div>
          {/each}
        </section>
      {/each}
    </div>
  {/snippet}
</ElectionGraphic>

<style>
  .chart {
    color: var(--text-color);
    font-size: var(--text-xs);
  }
  .backdrop {
    padding: 12px 8px 8px;
    background: var(--neutral-gray-50);
  }
  section + section {
    margin-top: 24px;
  }
  h3 {
    font-size: var(--text-s);
    margin: 16px 0 8px;
  }
  .encoding,
  .note {
    color: var(--neutral-gray-600);
    margin: 0 0 8px;
  }
  .year-row {
    display: grid;
    grid-template-columns: 4ch minmax(0, 1fr);
    gap: 12px;
    margin-top: 14px;
    align-items: start;
  }
  .year {
    padding-top: 6px;
    font-weight: 500;
  }
  .bars {
    display: flex;
    height: 32px;
  }
  .segment {
    min-width: 0;
    transition: opacity 150ms ease;
  }
  .bar {
    display: block;
    width: 100%;
    padding: 0;
    background: transparent;
    position: relative;
    height: 32px;
    border: 2px solid var(--party-color);
    box-sizing: border-box;
    overflow: hidden;
    border-radius: 2px;
  }
  .elected {
    position: absolute;
    inset: 0 auto 0 0;
    background: var(--party-color);
  }
  .pending {
    border-color: var(--neutral-gray-400);
    background: repeating-linear-gradient(
      135deg,
      transparent 0 4px,
      var(--neutral-gray-300) 4px 6px
    );
  }
  .summary {
    margin: 6px 0 0;
  }
  @media (prefers-reduced-motion: reduce) {
    .segment {
      transition: none;
    }
  }
</style>
