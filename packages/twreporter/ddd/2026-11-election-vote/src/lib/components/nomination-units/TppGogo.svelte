<script lang="ts">
  import Tooltip from '@lab-reporter/ddd-shared/components/shared/Tooltip.svelte'
  import TooltipRows from '@lab-reporter/ddd-shared/components/shared/TooltipRows.svelte'
  import type { ComponentProps } from '@lab-reporter/ddd-shared/components/types.ts'
  import { createQuery } from '@tanstack/svelte-query'
  import { secondBatch } from '../../batches/second.ts'
  import { historicalElectionTabs } from '../../election-historical-data.ts'
  import ElectionGraphic from '../../ElectionGraphic.svelte'

  function fitUnits(
    node: HTMLDivElement,
    options: { sized: boolean; columns: number; gap: number },
  ) {
    let frame = 0
    function fit() {
      if (!options.sized) {
        node.style.removeProperty('--unit-height')
        const content = node.querySelector<HTMLElement>('.chart-content')
        content?.style.removeProperty('zoom')
        return
      }
      const content = node.querySelector<HTMLElement>('.chart-content')!
      const style = getComputedStyle(node)
      const available =
        node.clientHeight -
        parseFloat(style.paddingTop) -
        parseFloat(style.paddingBottom)
      if (available <= 0) return
      const scale = node.getBoundingClientRect().height / node.offsetHeight
      if (scale <= 0) return
      content.style.removeProperty('zoom')
      node.style.setProperty('--unit-height', '8px')
      // Keep the fixed text layout from consuming the entire cell-height budget.
      const naturalHeight = content.getBoundingClientRect().height / scale
      if (naturalHeight > available)
        content.style.zoom = String(available / naturalHeight)
      let low = 0
      let high = available
      // Measure the real layout: each year must also fit its statistics column.
      for (let i = 0; i < 12; i++) {
        const height = (low + high) / 2
        node.style.setProperty('--unit-height', height + 'px')
        if (content.getBoundingClientRect().height / scale <= available)
          low = height
        else high = height
      }
      node.style.setProperty('--unit-height', Math.floor(low * 64) / 64 + 'px')
    }
    function schedule() {
      cancelAnimationFrame(frame)
      frame = requestAnimationFrame(fit)
    }
    const observer = new ResizeObserver(schedule)
    observer.observe(node)
    schedule()
    return {
      update(value: typeof options) {
        options = value
        schedule()
      },
      destroy() {
        observer.disconnect()
        cancelAnimationFrame(frame)
      },
    }
  }
  const { config, ratio }: Pick<ComponentProps, 'config' | 'ratio'> = $props()
  const nominations = createQuery(
    () => historicalElectionTabs.councilNominations.options,
  )
  const parties = [{ label: '民眾黨', color: 'var(--elec-tpp)' }]
  let active = $state<string>()
  const sections = $derived(
    ['民眾黨'].map((title) => ({
      title,
      years: ([2022, 2026] as const).map((year) => {
        const bars = parties.map((party) => {
          const rows = (nominations.data ?? []).filter(
            (row) => row.政黨 === party.label,
          )
          const available = rows.some(
            (row) => year === 2026 || row[`${year} 提名`] !== null,
          )
          const total = rows.reduce(
            (sum, row) =>
              sum +
              (year === 2026 ? row['2026 候選人'] : (row[`${year} 提名`] ?? 0)),
            0,
          )
          const elected = rows.some((row) => row[`${year} 當選`] !== null)
            ? rows.reduce((sum, row) => sum + (row[`${year} 當選`] ?? 0), 0)
            : null
          return { ...party, total, elected, available }
        })
        return {
          year,
          bars,
          total: bars.reduce((sum, bar) => sum + bar.total, 0),
          elected: bars.some((bar) => bar.elected !== null)
            ? bars.reduce((sum, bar) => sum + (bar.elected ?? 0), 0)
            : null,
          available: bars.some((bar) => bar.available),
        }
      }),
    })),
  )
</script>

<ElectionGraphic
  batch={secondBatch}
  {config}
  {ratio}
  graphicKey="5-tpp-gogo"
  error={nominations.error?.message}
  loading={nominations.isPending}
  empty={!nominations.data?.length}
>
  {#snippet children(entry)}
    {@const sized = Boolean(
      entry.ratio || entry.containerHeight || entry.containerAspectRatio,
    )}
    <div
      class="chart"
      use:fitUnits={{
        sized,
        columns: entry.unitColumns ?? 10,
        gap: entry.unitGap ?? 4,
      }}
      class:sized
      class:backdrop={entry.chartBackdrop}
    >
      <div class="chart-content">
        {#each sections as section}
          <section aria-label={section.title}>
            {#each section.years as row}
              <div class="year-row" class:with-totals={entry.showTotals}>
                <div class="year-summary">
                  <span class="year">{row.year}</span>
                  {#if entry.showTotals}
                    <div class="summary" aria-label={`${row.year} 人數統計`}>
                      <div class="stat">
                        <span>當選</span><strong>{row.elected ?? '-'}</strong>
                      </div>
                      <div class="stat">
                        <span>提名</span><strong>{row.total}</strong>
                      </div>
                      <div class="stat">
                        <span>當選率</span><strong
                          >{row.elected === null || !row.total
                            ? '-'
                            : `${Number(((row.elected / row.total) * 100).toFixed(1))}%`}</strong
                        >
                      </div>
                    </div>
                  {/if}
                </div>
                <div class="year-content">
                  {#if row.available}
                    <div
                      class="parties"
                      style:--unit-columns={entry.unitColumns ?? 10}
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
                                rows={[
                                  {
                                    label: '當選',
                                    value:
                                      bar.elected === null
                                        ? '-'
                                        : `${bar.elected} 人`,
                                    color: bar.color,
                                  },
                                  {
                                    label: '未當選',
                                    value:
                                      bar.elected === null
                                        ? '-'
                                        : `${bar.total - bar.elected} 人`,
                                    color: `color-mix(in srgb, ${bar.color} 20%, transparent)`,
                                  },
                                ]}
                              />
                            {/snippet}
                          </Tooltip>
                        </div>
                      {/each}
                    </div>
                  {:else}
                    <p class="note">2019 年成立，未參與 2018 選舉。</p>
                  {/if}
                </div>
              </div>
            {/each}
          </section>
        {/each}
      </div>
    </div>
  {/snippet}
</ElectionGraphic>

<style>
  .chart {
    color: var(--text-color);
    font-size: var(--text-xs);
  }
  .sized {
    min-height: 0;
  }
  .chart-content {
    display: flow-root;
  }
  .backdrop {
    padding: 12px 8px 8px;
    background: var(--neutral-gray-50);
  }
  section + section {
    margin-top: 24px;
  }
  .note {
    color: var(--neutral-gray-500);
    margin: 0 0 8px;
    text-align: center;
  }
  .year-row {
    display: grid;
    grid-template-columns: 110px minmax(0, 1fr);
    gap: 15px;
    margin-top: 12px;
    align-items: start;
  }
  .year-row.with-totals {
    grid-template-columns: 110px minmax(0, 1fr);
  }
  .year-summary {
    grid-column: 1;
    grid-row: 1;
    align-self: stretch;
    border-right: 1px solid var(--neutral-gray-300);
    padding-right: 15px;
  }
  .year-content {
    grid-column: 2;
    grid-row: 1;
    min-width: 0;
  }
  .summary {
    display: flex;
    align-self: stretch;
    flex-direction: column;
    align-items: stretch;
    gap: 3px;
    color: var(--neutral-gray-800);
  }
  .stat {
    display: flex;
    align-items: flex-end;
    justify-content: space-between;
    gap: 6px;
    line-height: 1.2;
  }
  .stat > span {
    white-space: nowrap;
    font-size: 14px;
    letter-spacing: 0.1em;
  }
  .stat strong {
    font-size: 16px;
    font-weight: 600;
    line-height: 1.2;
  }
  .year {
    display: block;
    margin-bottom: 12px;
    padding-bottom: 12px;
    border-bottom: 1px solid var(--neutral-gray-300);
    padding-top: 0;
    font-weight: 500;
    font-size: 24px;
    line-height: 1.2;
  }
  .parties {
    display: grid;
    gap: 4px;
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
    row-gap: min(var(--unit-gap), calc(var(--unit-height, 100px) * 0.2));
  }
  .unit {
    display: block;
    width: 100%;
    aspect-ratio: 1;
    height: var(--unit-height, auto);
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
    background: transparent;
    border: 1px solid color-mix(in srgb, var(--party-color) 50%, transparent);
  }
  .unit:focus-visible {
    outline: 2px solid var(--text-color);
    outline-offset: 1px;
  }
  @container (max-width: 580px) {
    .sized .note,
    .sized .summary,
    .sized .year {
      line-height: 1.2;
    }
    .sized .note {
      margin-bottom: 2px;
    }
    .sized .year {
      padding-top: 0;
    }
    .sized .year-row {
      margin-top: 2px;
      gap: 6px;
    }
    .sized section + section {
      margin-top: 4px;
    }
    .sized .parties {
      gap: 2px;
    }
    .year-row.with-totals {
      grid-template-columns: 90px minmax(0, 1fr);
    }
    .summary {
      gap: 3px;
    }
    .stat strong {
      font-size: 14px;
    }
  }
  @media (prefers-reduced-motion: reduce) {
    .party {
      transition: none;
    }
  }
</style>
