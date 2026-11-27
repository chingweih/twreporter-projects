<script lang="ts">
  import Legend from '@lab-reporter/ddd-shared/components/shared/Legend.svelte'
  import { MapDrilldown } from '@lab-reporter/ddd-shared/utils/map-drilldown.svelte.ts'
  import { createQuery, skipToken } from '@tanstack/svelte-query'
  import { electionTabs } from '../../election-data.ts'
  import { resolvePartyColor } from '../../party-colors.ts'
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
  const legend = $derived.by(() => {
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
{/snippet}

<div class="city-maps">
  {#if results.data || (previous && historicalQuery.data)}
    <div class="legend-container">
      <Legend
        align="center"
        items={[
          ...legend,
          ...(areaColors.has(noLeader)
            ? [{ label: '未分出領先者', color: `var(${noLeader})` }]
            : []),
        ]}
      />
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
    display: flex;
    flex: 1 1 auto;
    flex-direction: column;
    min-height: 0;
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
    min-height: 40px;
    border-radius: 2px;
    border-bottom: 1px solid var(--neutral-gray-300);
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
