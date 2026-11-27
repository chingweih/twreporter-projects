<script lang="ts">
  import Legend from '@lab-reporter/ddd-shared/components/shared/Legend.svelte'
  import { MapDrilldown } from '@lab-reporter/ddd-shared/utils/map-drilldown.svelte.ts'
  import { createQuery, skipToken } from '@tanstack/svelte-query'
  import { electionTabs } from '../../election-data.ts'
  import { partyColorVars, resolvePartyColor } from '../../party-colors.ts'
  import {
    areaColor,
    indexAreaResults,
    indexHistoricalAreaResults,
    noLeader,
    type AreaResult,
    type HistoricalCityGeometry,
  } from './data.ts'
  import DistrictVillageMap from './DistrictVillageMap.svelte'
  import { assignedVillagesInDistrict, type CityGeometry } from './geometry.ts'

  const {
    current,
    previous,
  }: {
    current: CityGeometry
    previous?: HistoricalCityGeometry
  } = $props()

  const drilldown = new MapDrilldown((key) =>
    current.districts.features.find(
      ({ properties }) => properties.districtCode === key,
    ),
  )
  const focus = $derived(drilldown.focus)
  const cityCode = $derived(
    current.districts.features[0]?.properties.countyCode,
  )
  const townshipQuery = createQuery(() => ({
    ...electionTabs.mayorByTownship.options,
    select: (rows) =>
      indexAreaResults({
        rows,
        cityCode,
        codeLength: 8,
        getCode: (row) => row.鄉鎮市區代碼,
      }),
  }))
  const villageQuery = createQuery(() => ({
    ...electionTabs.mayorByVillage.options,
    select: (rows) =>
      indexAreaResults({
        rows,
        cityCode,
        codeLength: 11,
        getCode: (row) => row.村里代碼,
      }),
  }))
  const results = $derived(focus ? villageQuery : townshipQuery)
  const cityCandidates = createQuery(() => ({
    ...electionTabs.mayorCandidates.options,
    enabled: !previous,
    select: (rows) =>
      rows
        .filter(
          (row) =>
            row.縣市代碼.trim().padStart(5, '0') === cityCode &&
            row.姓名.trim(),
        )
        .sort((a, b) => b.得票數 - a.得票數 || a.號次 - b.號次),
  }))
  const historicalTownships = createQuery(() => ({
    ...(previous?.townshipResults.options ?? {
      queryKey: ['historical-city-results', 'township'] as const,
      queryFn: skipToken,
    }),
    select: (rows) =>
      indexHistoricalAreaResults({ rows, cityCode, villages: false }),
  }))
  const historicalVillages = createQuery(() => ({
    ...(previous?.villageResults.options ?? {
      queryKey: ['historical-city-results', 'village'] as const,
      queryFn: skipToken,
    }),
    select: (rows) =>
      indexHistoricalAreaResults({ rows, cityCode, villages: true }),
  }))
  const historicalQuery = $derived(
    focus ? historicalVillages : historicalTownships,
  )

  const areaColors = $derived(
    new Set([
      ...visibleColors(current, results.data),
      ...(previous ? visibleColors(previous, historicalQuery.data) : []),
    ]),
  )

  function visibleColors(
    geometry: CityGeometry,
    data?: ReadonlyMap<string, AreaResult>,
  ) {
    if (!data) return []
    return focus
      ? assignedVillagesInDistrict(
          geometry.villages,
          drilldown.selectedKey,
        ).map(({ properties }) => areaColor(data.get(properties.villageCode)))
      : geometry.districts.features.map(({ properties }) =>
          areaColor(data.get(properties.districtCode)),
        )
  }
  const rankedCandidates = $derived(
    (cityCandidates.data ?? [])
      .filter((candidate) =>
        ['民主進步黨', '中國國民黨'].includes(
          resolvePartyColor(candidate.政黨).label,
        ),
      )
      .map((candidate) => ({
        candidate,
        count: current.districts.features.filter(({ properties }) => {
          const result = townshipQuery.data?.get(properties.districtCode)
          return (
            result &&
            !result.tied &&
            result.leader.姓名.trim() === candidate.姓名.trim()
          )
        }).length,
      }))
      .sort(
        (a, b) => b.count - a.count || b.candidate.得票數 - a.candidate.得票數,
      )
      .map(({ candidate, count }) => ({
        label: candidate.姓名.trim(),
        share: candidate['得票率(%)'],
        count: townshipQuery.data ? count : null,
        color: `var(${resolvePartyColor(candidate.政黨).colorVar})`,
      })),
  )
  const legend = $derived.by(() => {
    if (!previous) return rankedCandidates
    const candidates = new Map<string, { label: string; color: string }>()
    for (const data of [
      results.data,
      previous ? historicalQuery.data : undefined,
    ]) {
      for (const result of data?.values() ?? []) {
        for (const candidate of [
          ...result.majorPartyCandidates,
          result.leader,
        ]) {
          const party = resolvePartyColor(candidate.政黨.trim())
          const label = previous ? party.label : candidate.姓名.trim()
          const { colorVar } = party
          const color = `var(${colorVar})`
          candidates.set(`${label}:${colorVar}`, { label, color })
        }
      }
    }
    return [...candidates.values()]
  })
  const comparisonRows = $derived.by(() => {
    if (!previous) return []
    const oldColors = previous.districts.features.map(({ properties }) =>
      areaColor(historicalTownships.data?.get(properties.districtCode)),
    )
    const newColors = current.districts.features.map(({ properties }) =>
      areaColor(townshipQuery.data?.get(properties.districtCode)),
    )
    return Object.entries(partyColorVars)
      .filter(([party]) => party === '中國國民黨' || party === '民主進步黨')
      .map(([party, token]) => ({
        party,
        previous: historicalTownships.data
          ? oldColors.filter((color) => color === token).length
          : null,
        current: townshipQuery.data
          ? newColors.filter((color) => color === token).length
          : null,
      }))
  })
</script>

{#snippet status(query: typeof results)}
  {#if query.isPending}
    <p class="status" role="status">開票資料載入中……</p>
  {:else if query.isError}
    <p class="status" role="status">無法載入開票資料。</p>
  {/if}
{/snippet}

{#snippet panelHeading(year: number, query: typeof results)}
  <header class="panel-heading">
    <h2>{year}</h2>
    {@render status(query)}
  </header>
  <table class="party-summary" aria-label={`${year} 各黨票數最高行政區數`}>
    <thead>
      <tr
        ><th scope="col"><span class="sr-only">政黨</span></th><th scope="col"
          >票數最高</th
        >{#if year === 2026}<th scope="col">翻轉</th>{/if}</tr
      >
    </thead>
    <tbody>
      {#each comparisonRows as row}
        {@const count = year === 2022 ? row.previous : row.current}
        {@const change =
          row.current !== null && row.previous !== null
            ? Math.max(row.current - row.previous, 0)
            : null}
        <tr>
          <th scope="row">{row.party}</th>
          <td>{count === null ? '—' : `${count} 區`}</td>
          {#if year === 2026}<td>{change === null ? '—' : `${change} 區`}</td
            >{/if}
        </tr>
      {/each}
    </tbody>
  </table>
{/snippet}

<div class="city-maps">
  {#if results.data || (previous && historicalQuery.data)}
    <div class="legend-container" class:ranked={!previous}>
      <Legend
        align="center"
        items={[
          ...legend,
          ...(areaColors.has(noLeader)
            ? [{ label: '未分出領先者', color: `var(${noLeader})` }]
            : []),
        ]}
      >
        {#snippet children(label)}
          {@const candidate = !previous
            ? rankedCandidates.find((item) => item.label === label)
            : undefined}
          {#if candidate}
            <div class="candidate-legend-row">
              <span class="candidate-name">{label}</span>
              <span class="candidate-share">{candidate.share.text}%</span>
              <span class="candidate-count"
                >{candidate.count === null ? '—' : `${candidate.count}區`}</span
              >
            </div>
          {:else}
            {label}
          {/if}
        {/snippet}
      </Legend>
    </div>
  {/if}
  {#if !previous}
    {@render status(results)}
  {/if}
  <div class="maps" class:comparison={Boolean(previous)}>
    {#if previous}
      <section class="map-panel" aria-label="2022">
        {@render panelHeading(2022, historicalQuery)}
        <DistrictVillageMap
          geometry={previous}
          counterpart={current}
          frame={current.districts}
          {drilldown}
          results={historicalQuery}
        />
      </section>
    {/if}
    <section class="map-panel" aria-label={previous ? '2026' : undefined}>
      {#if previous}
        {@render panelHeading(2026, results)}
      {/if}
      <DistrictVillageMap
        geometry={current}
        counterpart={previous}
        frame={current.districts}
        {drilldown}
        {results}
      />
      {#if !previous}
        <p class="turnout">
          投票率｜{cityCandidates.data?.[0]
            ? `${cityCandidates.data[0]['投票率(%)'].toLocaleString('zh-TW', { maximumFractionDigits: 1 })}%`
            : '—'}
        </p>
      {/if}
    </section>
  </div>

  {#if focus}
    <div class="map-actions">
      <button
        type="button"
        bind:this={drilldown.backButton}
        onclick={() => drilldown.reset()}
      >
        <!-- <svg width="22" height="22" viewBox="0 0 24 24" aria-hidden="true">
          <path
            d="M21 12H3m0 0 8-8m-8 8 8 8"
            fill="none"
            stroke="currentColor"
            stroke-width="2"
            stroke-linecap="round"
            stroke-linejoin="round"
          />
        </svg> -->
        返回全市
      </button>
    </div>
  {/if}
</div>

<style>
  .city-maps {
    position: relative;
    display: flex;
    flex: 1 1 auto;
    flex-direction: column;
    min-height: 0;
    gap: 5px;
  }

  .map-actions {
    display: flex;
    flex-shrink: 0;
    justify-content: center;
    margin-top: 8px;
  }

  button {
    display: inline-flex;
    align-items: center;
    gap: 6px;
    padding: 5px 14px;
    border: 1px solid var(--chart-earth-3);
    border-radius: 20px;
    background: transparent;
    color: var(--chart-earth-3);
    font: inherit;
    font-size: var(--text-s);
    cursor: pointer;
    transition: background 0.15s ease-in-out;
  }

  button:focus {
    outline: none;
  }
  button:focus-visible {
    background: var(--chart-earth-3);
  }
  button:hover {
    outline: none;
    background: var(--chart-earth-3);
    color: var(--neutral-gray-100);
    font-weight: 400;
  }

  .maps {
    --map-min-height: 144px;
    --map-gap: 16px;

    display: grid;
    flex: 1 1 auto;
    grid-auto-rows: minmax(var(--map-min-height), 1fr);
    gap: var(--map-gap);
    min-height: var(--map-min-height);
  }

  .comparison {
    min-height: calc(2 * var(--map-min-height) + var(--map-gap));
  }

  .map-panel {
    position: relative;
    display: flex;
    flex-direction: column;
    min-width: 0;
    min-height: 0;
  }

  .legend-container {
    flex-shrink: 0;
    width: 100%;
    min-width: 0;
    font-size: var(--text-xs);
    color: var(--neutral-gray-800);
  }
  .legend-container :global(.legend) {
    margin: 0;
  }
  .ranked :global(.legend) {
    flex-direction: column;
    flex-wrap: nowrap;
    align-items: flex-start;
    width: fit-content;
    margin: 0;
    font-variant-numeric: tabular-nums;
  }
  .legend-container.ranked {
    position: absolute;
    top: 8px;
    right: 8px;
    z-index: 1;
    width: max-content;
    max-width: calc(100% - 16px);
  }
  .candidate-legend-row {
    display: grid;
    grid-template-columns: 3em 6ch max-content;
    align-items: center;
    gap: 6px;
    white-space: nowrap;
  }
  .candidate-share {
    text-align: right;
  }
  .candidate-count {
    padding-left: 6px;
    border-left: 1px solid var(--neutral-gray-300);
  }
  .turnout {
    position: absolute;
    bottom: 8px;
    right: 8px;
    margin: 0;
    font-size: var(--text-s);
    font-variant-numeric: tabular-nums;
    pointer-events: none;
    color: var(--neutral-gray-600);
  }

  .status {
    margin: 0;
    color: var(--neutral-gray-700);
    font-size: var(--text-xs);
  }

  .panel-heading {
    display: flex;
    flex-wrap: wrap;
    align-items: baseline;
    padding: 0 0 5px 0;
    flex-shrink: 0;
    border-bottom: 1px solid var(--neutral-gray-600);
  }
  .party-summary {
    width: 100%;
    margin-bottom: 12px;
    border-collapse: collapse;
    border-bottom: 1px solid var(--neutral-gray-600);
    font-size: var(--text-s);
    font-variant-numeric: tabular-nums;
  }
  .party-summary th,
  .party-summary td {
    padding: 6px;
    font-weight: 400;
    white-space: nowrap;
    text-align: right;
  }
  .party-summary tbody th {
    text-align: left;
  }
  .party-summary tr {
    border-bottom: 1px solid var(--neutral-gray-300);
  }
  .sr-only {
    position: absolute;
    width: 1px;
    height: 1px;
    overflow: hidden;
    clip-path: inset(50%);
  }

  h2 {
    width: 100%;
    margin: 0;
    text-align: center;
    font-size: var(--text-m);
    font-weight: 700;
  }

  @container (width >= 600px) {
    .comparison {
      grid-template-columns: repeat(2, minmax(0, 1fr));
      min-height: var(--map-min-height);
    }
  }
</style>
