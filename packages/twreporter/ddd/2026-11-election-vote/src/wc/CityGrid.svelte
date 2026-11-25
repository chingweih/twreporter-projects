<script lang="ts">
  import Legend from '@lab-reporter/ddd-shared/components/shared/Legend.svelte'
  import TooltipOverlay from '@lab-reporter/ddd-shared/components/shared/TooltipOverlay.svelte'
  import TooltipRows from '@lab-reporter/ddd-shared/components/shared/TooltipRows.svelte'
  import type { ComponentProps } from '@lab-reporter/ddd-shared/components/types.ts'
  import { createQuery } from '@tanstack/svelte-query'
  import { firstBatch } from '../lib/batches/first.ts'
  import { historicalElectionTabs } from '../lib/election-historical-data.ts'
  import ElectionGraphic from '../lib/ElectionGraphic.svelte'

  const { config }: Pick<ComponentProps, 'config'> = $props()
  const history = createQuery(
    () => historicalElectionTabs.mayorPartyHistory.options,
  )
  const colors: Record<string, string> = {
    國民黨: 'var(--elec-kmt)',
    民進黨: 'var(--elec-dpp)',
    民眾黨: 'var(--elec-tpp)',
    親民黨: 'var(--elec-pfp)',
    新黨: 'var(--elec-new)',
    無黨籍: 'var(--elec-gray-3)',
    未有資料: 'var(--neutral-gray-100)',
  }
  const years = $derived(
    [...new Set((history.data ?? []).map((row) => row.屆次))].sort(),
  )
  const rows = $derived(
    [...new Set((history.data ?? []).map((row) => row.縣市))].map((city) => ({
      city,
      cells: years.map((year) => {
        const row = history.data?.find(
          (row) => row.縣市 === city && row.屆次 === year,
        )
        return {
          city,
          year,
          party: row?.政黨 || '未有資料',
          name: row?.當選人 || '—',
        }
      }),
    })),
  )
  const items = $derived(
    [
      ...new Set(rows.flatMap((row) => row.cells.map((cell) => cell.party))),
    ].map((label) => ({ label, color: colors[label] ?? 'var(--elec-gray-3)' })),
  )
  type Cell = { city: string; year: string; party: string; name: string }
  let hovered = $state.raw<Cell>()
  let activeParty = $state<string>()
  let pointer = $state({ x: 0, y: 0 })
  function focusCell(cell: Cell, x: number, y: number) {
    hovered = cell
    pointer = { x, y }
  }
</script>

<ElectionGraphic
  batch={firstBatch}
  {config}
  graphicKey="2-city-grid"
  error={history.error?.message}
  loading={history.isPending}
  empty={!rows.length}
>
  {#snippet children(entry)}
    <div
      class="chart"
      class:sized={!!(entry.containerHeight || entry.containerAspectRatio)}
      class:backdrop={entry.chartBackdrop}
    >
      <Legend
        {items}
        active={activeParty ?? hovered?.party}
        onhover={(party) => (activeParty = party)}
      />
      <div
        class="grid"
        role="group"
        aria-label={entry.title}
        style:grid-template-columns={`max-content repeat(${years.length}, minmax(0, 1fr))`}
        style:grid-template-rows={`${entry.showXAxis ? 'auto ' : ''}repeat(${rows.length}, ${entry.containerHeight || entry.containerAspectRatio ? 'minmax(0, 1fr)' : 'minmax(14px, 1fr)'})`}
        style:gap={`${entry.cellGap ?? 4}px`}
      >
        {#if entry.showXAxis}
          <span aria-hidden="true"></span>
          {#each years as year}<span
              class="axis year"
              class:focused={entry.hoverFocusXAxis !== false &&
                hovered?.year === year}
              class:dimmed={entry.hoverFocusXAxis !== false &&
                hovered !== undefined &&
                hovered.year !== year}
              style:font-size={entry.xAxisFontSize
                ? `${entry.xAxisFontSize}px`
                : undefined}>{year}</span
            >{/each}
        {/if}
        {#each rows as row}
          <span
            class="axis city"
            class:focused={entry.hoverFocusYAxis !== false &&
              hovered?.city === row.city}
            class:dimmed={entry.hoverFocusYAxis !== false &&
              hovered !== undefined &&
              hovered.city !== row.city}
            style:font-size={entry.yAxisFontSize
              ? `${entry.yAxisFontSize}px`
              : undefined}>{row.city}</span
          >
          {#each row.cells as cell}
            <button
              type="button"
              class="cell"
              style:background-color={colors[cell.party] ??
                'var(--elec-gray-3)'}
              class:dimmed={activeParty !== undefined
                ? activeParty !== cell.party
                : hovered !== undefined && hovered !== cell}
              aria-label={`${cell.city} ${cell.year} ${cell.name} ${cell.party}`}
              onpointerenter={(event) => {
                if (event.pointerType !== 'touch')
                  focusCell(cell, event.clientX, event.clientY)
              }}
              onpointermove={(event) => {
                if (event.pointerType !== 'touch')
                  pointer = { x: event.clientX, y: event.clientY }
              }}
              onpointerleave={() => (hovered = undefined)}
              onpointercancel={() => (hovered = undefined)}
              onfocus={(event) => {
                const bounds = event.currentTarget.getBoundingClientRect()
                focusCell(cell, bounds.x + bounds.width / 2, bounds.bottom)
              }}
              onblur={() => (hovered = undefined)}
              onkeydown={(event) => {
                if (event.key === 'Escape') hovered = undefined
              }}
            >
              {#if entry.showValues || hovered === cell}
                <span>{cell.name}</span>
              {/if}
            </button>
          {/each}
        {/each}
      </div>
    </div>
    {#if entry.showTooltip && hovered}<TooltipOverlay
        title={`${hovered.city} · ${hovered.year}`}
        x={pointer.x}
        y={pointer.y}
      >
        <TooltipRows
          rows={[
            {
              label: hovered.party,
              value: hovered.name,
              color: colors[hovered.party],
            },
          ]}
        />
      </TooltipOverlay>{/if}
  {/snippet}
</ElectionGraphic>

<style>
  .chart {
    display: flex;
    flex-direction: column;
    gap: 7px;
    height: var(--city-grid-height, auto);
    min-height: 0;
    color: var(--text-color);
    font-size: var(--text-xs);
  }
  .backdrop {
    padding: 12px 8px 8px;
    background: var(--neutral-gray-50);
  }
  .grid {
    display: grid;
    flex: 1 1 auto;
    min-height: 0;
    aspect-ratio: var(--city-grid-aspect-ratio, 3 / 4);
  }
  .sized .grid {
    aspect-ratio: auto;
  }
  .axis {
    display: flex;
    align-items: center;
    color: var(--neutral-gray-700);
    transition: opacity 150ms ease;
  }
  .year {
    justify-content: center;
    text-align: center;
    overflow-wrap: anywhere;
  }
  .city {
    justify-content: flex-end;
    padding-right: 4px;
  }
  .focused {
    font-weight: 500;
    color: var(--text-color);
  }
  .cell {
    min-width: 0;
    padding: 2px;
    border: 0;
    border-radius: 2px;
    color: inherit;
    font: inherit;
    cursor: pointer;
    overflow: hidden;
    transition: opacity 150ms ease;
  }
  .cell span {
    display: block;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }
  .cell:focus-visible {
    outline: 2px solid var(--text-color);
    outline-offset: 1px;
  }
  .dimmed {
    opacity: 0.25;
  }
  @media (prefers-reduced-motion: reduce) {
    .axis,
    .cell {
      transition: none;
    }
  }
</style>
