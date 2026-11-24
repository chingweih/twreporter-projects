<script lang="ts">
  import type { MapTooltipTarget } from '@lab-reporter/ddd-shared/components/shared/D3Map.svelte'
  import { createQuery, skipToken } from '@tanstack/svelte-query'
  import { tick } from 'svelte'
  import { electionTabs } from '../../election-data.ts'
  import { partyColorVars } from '../../party-colors.ts'
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

  let selectedCode = $state<string>()
  let tooltipTarget = $state.raw<MapTooltipTarget>()
  let trigger: SVGPathElement | undefined
  const focus = $derived(
    current.districts.features.find(
      ({ properties }) => properties.districtCode === selectedCode,
    ),
  )
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
      ? assignedVillagesInDistrict(geometry.villages, selectedCode).map(
          ({ properties }) => areaColor(data.get(properties.villageCode)),
        )
      : geometry.districts.features.map(({ properties }) =>
          areaColor(data.get(properties.districtCode)),
        )
  }
  const legend = $derived(
    Object.entries(partyColorVars).filter(
      ([party, token]) =>
        party === '中國國民黨' ||
        party === '民主進步黨' ||
        areaColors.has(token),
    ),
  )

  function selectDistrict(code: string, button: SVGPathElement) {
    if (selectedCode !== undefined) return
    trigger = button
    tooltipTarget = undefined
    selectedCode = code
  }

  async function showDistricts() {
    tooltipTarget = undefined
    selectedCode = undefined
    await tick()
    trigger?.focus({ preventScroll: true })
  }
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

<div class="toolbar">
  {#if focus}
    <button
      type="button"
      onclick={showDistricts}
      {@attach (button) => button.focus({ preventScroll: true })}
    >
      <svg width="22" height="22" viewBox="0 0 24 24" aria-hidden="true">
        <path
          d="M21 12H3m0 0 8-8m-8 8 8 8"
          fill="none"
          stroke="currentColor"
          stroke-width="2"
          stroke-linecap="round"
          stroke-linejoin="round"
        />
      </svg>
      返回全市
    </button>
  {/if}
  {#if !previous}
    {@render status(results)}
  {/if}
  {#if results.data || (previous && historicalQuery.data)}
    <ul class="legend" aria-label="得票最高候選人的政黨">
      {#each legend as [party, token] (party)}
        <li>
          <span class="swatch" style:background="var({token})"></span>{party}
        </li>
      {/each}
      {#if areaColors.has(noLeader)}
        <li>
          <span class="swatch" style:background="var({noLeader})"></span>
          未分出領先者
        </li>
      {/if}
    </ul>
  {/if}
</div>
<div class="maps" class:comparison={Boolean(previous)}>
  {#if previous}
    <section class="map-panel" aria-label="2022">
      {@render panelHeading(2022, historicalQuery)}
      <DistrictVillageMap
        geometry={previous}
        counterpart={current}
        frame={current.districts}
        {focus}
        onselect={selectDistrict}
        onreset={showDistricts}
        results={historicalQuery}
        bind:tooltipTarget
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
      {focus}
      onselect={selectDistrict}
      onreset={showDistricts}
      {results}
      bind:tooltipTarget
    />
  </section>
</div>

<style>
  .toolbar {
    display: flex;
    flex-shrink: 0;
    align-items: center;
    flex-wrap: wrap;
    gap: 8px 16px;
    min-height: 40px;
    margin-bottom: 6px;
    color: var(--neutral-gray-800);
    font-size: var(--text-s);
  }

  button {
    display: inline-flex;
    align-items: center;
    gap: 6px;
    min-height: 40px;
    padding: 0;
    border: 0;
    border-radius: 3px;
    background: transparent;
    color: var(--neutral-black);
    font: inherit;
    font-size: var(--text-s);
    cursor: pointer;
  }

  button:focus {
    outline: none;
  }

  button:focus-visible {
    background: var(--neutral-gray-300);
  }

  .maps {
    --map-min-height: 144px;
    --map-gap: 16px;

    display: grid;
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

  .legend {
    display: flex;
    flex-wrap: wrap;
    gap: 4px 12px;
    margin: 0;
    padding: 0;
    color: var(--neutral-gray-800);
    font-size: var(--text-xs);
    list-style: none;
  }

  .legend li {
    display: flex;
    align-items: center;
    gap: 5px;
  }

  .swatch {
    width: 0.85em;
    height: 0.85em;
    border-radius: 2px;
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
    gap: 0 8px;
    flex-shrink: 0;
    margin-bottom: 6px;
  }

  h2 {
    margin: 0;
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
