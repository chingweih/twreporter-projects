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
      years: ([2018, 2022, 2026] as const)
        .filter((year) => sectionIndex !== 0 || year !== 2018)
        .map((year) => {
          const bars = parties
            .filter((_, index) =>
              sectionIndex === 0 ? index === 0 : index > 0,
            )
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
                  (year === 2026
                    ? row['2026 登記']
                    : (row[`${year} 提名`] ?? 0)),
                0,
              )
              const elected =
                year === 2026
                  ? null
                  : rows.reduce(
                      (sum, row) => sum + (row[`${year} 當選`] ?? 0),
                      0,
                    )
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
      {#each sections as section}
        <section aria-label={section.title}>
          <h3>{section.title}</h3>
          <p class="note">
            {section.title === '民眾黨'
              ? '2019 年成立，未參與 2018 選舉。'
              : '依 2026 聯盟成員回溯加總；2018、2022 各黨分別參選。'}
          </p>
          {#each section.years as row}
            <div class="year-row">
              <span class="year">{row.year}</span>
              <div>
                {#if row.available}
                  <div
                    class="parties"
                    style:--unit-columns={entry.unitColumns ?? 15}
                    style:--unit-gap={`${entry.unitGap ?? 4}px`}
                  >
                    {#each row.bars.filter((bar) => bar.total > 0) as bar}
                      <div
                        class="party"
                        style:--party-color={bar.color}
                        class:dimmed={active !== undefined &&
                          active !== bar.label}
                      >
                        <Tooltip
                          title={`${row.year} · ${bar.label}`}
                          onvisibilitychange={(visible) => {
                            if (visible) active = bar.label
                            else if (active === bar.label) active = undefined
                          }}
                        >
                          {#snippet children()}
                            <div
                              class="units"
                              role="group"
                              aria-label={bar.label}
                            >
                              {#each Array.from({ length: bar.total }, (_, index) => index) as index}
                                <button
                                  type="button"
                                  class="unit"
                                  class:unelected={bar.elected !== null &&
                                    index >= bar.elected}
                                  class:pending={bar.elected === null}
                                  aria-label={`${row.year} ${bar.label} 第 ${index + 1} 人：${bar.elected === null ? '待開票' : index < bar.elected ? '當選' : '未當選'}`}
                                ></button>
                              {/each}
                            </div>
                          {/snippet}
                          {#snippet content()}
                            <TooltipRows
                              rows={bar.elected === null
                                ? [
                                    {
                                      label: '登記（待開票）',
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
                                    {
                                      label: '未當選',
                                      value: `${bar.total - bar.elected} 人`,
                                      color: `color-mix(in srgb, ${bar.color} 20%, transparent)`,
                                    },
                                  ]}
                            />
                          {/snippet}
                        </Tooltip>
                      </div>
                    {/each}
                  </div>
                  {#if entry.showTotals}<p class="summary">
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
    padding: 6px 8px;
    border-radius: 2px;
    text-align: center;
    font-weight: 500;
    border-top: 1px solid var(--neutral-gray-300);
    border-bottom: 1px solid var(--neutral-gray-300);
  }
  .note {
    color: var(--neutral-gray-500);
    margin: 0 0 8px;
    text-align: center;
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
  .parties {
    display: grid;
    gap: 6px;
  }
  .party {
    min-width: 0;
    transition: opacity 150ms ease;
  }
  .dimmed {
    opacity: 0.25;
  }
  .units {
    display: grid;
    grid-template-columns: repeat(var(--unit-columns), minmax(0, 1fr));
    gap: var(--unit-gap);
  }
  .unit {
    display: block;
    width: 100%;
    aspect-ratio: 1;
    min-width: 0;
    padding: 0;
    border: 0;
    border-radius: 2px;
    background: var(--party-color);
  }
  .unelected {
    background: color-mix(in srgb, var(--party-color) 20%, transparent);
  }
  .pending {
    background: repeating-linear-gradient(
      135deg,
      transparent 0 4px,
      color-mix(in srgb, var(--party-color) 35%, transparent) 4px 6px
    );
    border: 1px solid color-mix(in srgb, var(--party-color) 50%, transparent);
  }
  .unit:focus-visible {
    outline: 2px solid var(--text-color);
    outline-offset: 1px;
  }
  @media (prefers-reduced-motion: reduce) {
    .party {
      transition: none;
    }
  }
</style>
