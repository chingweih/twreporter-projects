<script lang="ts">
  import Legend from '@lab-reporter/ddd-shared/components/shared/Legend.svelte'
  import { formatNumber } from '@lab-reporter/ddd-shared/utils/format.ts'
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
  let containerWidth = $state(0)
  const showMapTooltip = $derived(!previous || containerWidth > 580)
  const majorParties = ['中國國民黨', '民主進步黨'] as const
  let summaryTab = $state<'district' | 'village'>('district')
  let summaryDistrict = $state<string>()
  let selectedVillage = $state<string>()
  let lastSummaryTarget = $state.raw<typeof drilldown.tooltipTarget>()
  $effect(() => {
    const district = drilldown.selectedKey
    if (summaryDistrict !== district) {
      summaryDistrict = district
      selectedVillage = undefined
      summaryTab = 'district'
    }
    const target = drilldown.tooltipTarget
    if (target === lastSummaryTarget) return
    lastSummaryTarget = target
    if (!previous || containerWidth > 580 || !focus || target?.focus !== focus)
      return
    if (
      target &&
      [current, previous].some((geometry) =>
        geometry.villages.features.some(
          ({ properties }) => properties.villageCode === target.key,
        ),
      )
    ) {
      selectedVillage = target.key
      summaryTab = 'village'
    }
  })
  const villageName = $derived(
    [current, ...(previous ? [previous] : [])]
      .flatMap((geometry) => geometry.villages.features)
      .find(({ properties }) => properties.villageCode === selectedVillage)
      ?.properties.name,
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
  const rankedCandidates = $derived.by(() => {
    if (previous) return []
    const districtResults = townshipQuery.data
    const candidates = focus
      ? districtResults?.get(focus.properties.districtCode)
          ?.majorPartyCandidates
      : cityCandidates.data?.filter(({ 政黨 }) =>
          majorParties.some((party) => party === resolvePartyColor(政黨).label),
        )
    return (candidates ?? [])
      .map((candidate) => ({
        candidate,
        count: focus
          ? candidate.得票數
          : current.districts.features.filter(({ properties }) => {
              const result = districtResults?.get(properties.districtCode)
              return (
                result?.leader &&
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
        count: districtResults ? count : null,
        color: `var(${resolvePartyColor(candidate.政黨).colorVar})`,
      }))
  })
  function shortPartyName(name: string) {
    return name.replace('中國國民黨', '國民黨').replace('民主進步黨', '民進黨')
  }
  const legend = $derived.by(() => {
    if (!previous) return rankedCandidates
    const candidates = new Map<string, { label: string; color: string }>()
    for (const data of [results.data, historicalQuery.data]) {
      for (const result of data?.values() ?? []) {
        if (!result.leader) continue
        for (const candidate of [
          ...result.majorPartyCandidates,
          result.leader,
        ]) {
          const { label: party, colorVar } = resolvePartyColor(candidate.政黨)
          const label = shortPartyName(party)
          const color = `var(${colorVar})`
          candidates.set(`${label}:${colorVar}`, { label, color })
        }
      }
    }
    return [...candidates.values()]
  })
  const comparisonRows = $derived.by(() => {
    if (!previous || focus) return []
    const oldColors = previous.districts.features.map(({ properties }) =>
      areaColor(historicalTownships.data?.get(properties.districtCode)),
    )
    const newColors = current.districts.features.map(({ properties }) =>
      areaColor(townshipQuery.data?.get(properties.districtCode)),
    )
    return majorParties.map((party) => {
      const token = partyColorVars[party]
      return {
        party,
        previous: historicalTownships.data
          ? oldColors.filter((color) => color === token).length
          : null,
        current: townshipQuery.data
          ? newColors.filter((color) => color === token).length
          : null,
      }
    })
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
  {@const mobileTabs = Boolean(
    focus && containerWidth > 0 && containerWidth <= 580,
  )}
  {@const villageSelected =
    mobileTabs && summaryTab === 'village' && selectedVillage !== undefined}
  {@const tableQuery =
    focus && !villageSelected
      ? year === 2022
        ? historicalTownships
        : townshipQuery
      : query}
  {@const districtResult = focus
    ? tableQuery.data?.get(
        villageSelected ? selectedVillage! : focus.properties.districtCode,
      )
    : undefined}
  <header class="panel-heading">
    <h2>{year}</h2>
  </header>
  <div class="comparison-summary">
    <table
      class="party-summary"
      class:district-summary={Boolean(focus)}
      aria-label={`${year} ${focus ? `${villageSelected ? (villageName ?? selectedVillage) : focus.properties.name}各黨得票` : '各黨票數最高行政區數'}`}
    >
      <thead>
        {#if mobileTabs}
          <tr
            ><th colspan="2">
              <div
                class="summary-tabs"
                role="tablist"
                aria-label={`${year} 統計範圍`}
              >
                <button
                  class="summary-tab"
                  type="button"
                  role="tab"
                  aria-selected={!villageSelected}
                  onclick={() => (summaryTab = 'district')}
                  >{focus?.properties.name}</button
                >
                <button
                  class="summary-tab"
                  type="button"
                  role="tab"
                  aria-selected={Boolean(villageSelected)}
                  disabled={!selectedVillage}
                  onclick={() => (summaryTab = 'village')}
                  >{villageName ?? '點選村里'}</button
                >
              </div>
            </th></tr
          >
        {:else}
          <tr
            ><th scope="col"><span class="sr-only">政黨</span></th><th
              scope="col">{focus?.properties.name ?? '票數最高'}</th
            >{#if !focus && year === 2026}<th scope="col">翻轉</th>{/if}</tr
          >
        {/if}
      </thead>
      <tbody>
        {#if focus}
          {#each majorParties as party (party)}
            {@const candidate = districtResult?.majorPartyCandidates.find(
              ({ 政黨 }) => 政黨.trim() === party,
            )}
            <tr>
              <th scope="row">{shortPartyName(party)}</th>
              <td>
                {#if candidate}
                  <span>{formatNumber(candidate.得票數)}票</span>
                  <span class="district-share"
                    >({candidate['得票率(%)'].text}%)</span
                  >
                {:else}
                  —
                {/if}
              </td>
            </tr>
          {/each}
        {:else}
          {#each comparisonRows as row (row.party)}
            {@const count = year === 2022 ? row.previous : row.current}
            {@const change =
              row.current !== null && row.previous !== null
                ? Math.max(row.current - row.previous, 0)
                : null}
            <tr>
              <th scope="row">{shortPartyName(row.party)}</th>
              <td>{count === null ? '—' : `${count} 區`}</td>
              {#if year === 2026}<td
                  >{change === null ? '—' : `${change} 區`}</td
                >{/if}
            </tr>
          {/each}
        {/if}
      </tbody>
    </table>
    {@render status(tableQuery)}
  </div>
{/snippet}

<div class="city-maps" bind:clientWidth={containerWidth}>
  {#if !previous || results.data || historicalQuery.data}
    <div class="legend-container" class:ranked={!previous}>
      {#if !previous && focus}
        <p class="district-name">{focus.properties.name}</p>
      {/if}
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
                >{candidate.count === null
                  ? '—'
                  : focus
                    ? `${formatNumber(candidate.count)}票`
                    : `${candidate.count}區`}</span
              >
            </div>
          {:else}
            {label}
          {/if}
        {/snippet}
      </Legend>
      {#if !previous}
        {@render status(results)}
      {/if}
    </div>
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
          showTooltip={showMapTooltip}
          showBackButton
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
        showTooltip={showMapTooltip}
        showBackButton={!previous}
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
    grid-template-columns: repeat(2, minmax(0, 1fr));
    min-height: var(--map-min-height);
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
    -webkit-text-stroke: 3px var(--neutral-gray-100);
    paint-order: stroke fill;
  }
  .legend-container :global(.legend > li > span) {
    outline: 1px solid var(--neutral-gray-100);
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
  .district-name {
    margin: 0 0 4px;
    text-align: right;
    font-size: var(--text-s);
    font-weight: 700;
    -webkit-text-stroke: 3px var(--neutral-gray-100);
    paint-order: stroke fill;
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
  .ranked .status,
  .comparison-summary .status {
    text-align: right;
    -webkit-text-stroke: 3px var(--neutral-gray-100);
    paint-order: stroke fill;
  }

  .panel-heading {
    display: flex;
    flex-wrap: wrap;
    align-items: baseline;
    padding: 0 0 5px 0;
    flex-shrink: 0;
    border-bottom: 1px solid var(--neutral-gray-600);
  }
  .comparison-summary {
    position: relative;
    margin-bottom: 12px;
  }
  .comparison-summary .status {
    position: absolute;
    inset-block-start: 100%;
    inset-inline: 6px;
    z-index: 1;
    pointer-events: none;
  }
  .party-summary {
    width: 100%;
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
  .party-summary th:first-child {
    width: 1%;
  }
  .party-summary tr {
    border-bottom: 1px solid var(--neutral-gray-300);
  }
  .summary-tabs {
    display: grid;
    grid-template-columns: repeat(2, minmax(0, 1fr));
    gap: 0px;
  }
  .summary-tab {
    display: block;
    min-width: 0;
    padding: 0.5px 0px;
    border: 0;
    border-bottom: 2px solid transparent;
    border-radius: 0;
    background: transparent;
    color: var(--neutral-gray-600);
    font-size: 12px;
    white-space: normal;
  }
  .summary-tab[aria-selected='true'] {
    border-bottom-color: var(--neutral-gray-800);
    color: var(--neutral-gray-800);
    font-weight: 600;
  }
  .summary-tab:disabled {
    opacity: 0.5;
    cursor: default;
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

  @container (width < 600px) {
    /* .party-summary {
      font-size: 12px;
    } */
    .party-summary th,
    .party-summary td {
      padding: 6px 3px;
    }
  }
  @container (width < 480px) {
    .maps {
      --map-gap: 4px;
    }
    .district-summary {
      font-size: var(--text-xs);
    }
    .district-share {
      /* display: block; */
    }
  }
</style>
