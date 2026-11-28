<script lang="ts">
  import type { TaiwanDistrictCollection } from '@lab-reporter/ddd-atlas/taiwan/map'
  import D3DrilldownMap from '@lab-reporter/ddd-shared/components/shared/D3DrilldownMap.svelte'
  import TooltipRows from '@lab-reporter/ddd-shared/components/shared/TooltipRows.svelte'
  import { formatNumber } from '@lab-reporter/ddd-shared/utils/format.ts'
  import type { MapDrilldown } from '@lab-reporter/ddd-shared/utils/map-drilldown.svelte.ts'
  import type { CreateQueryResult } from '@tanstack/svelte-query'
  import { resolvePartyColor } from '../../party-colors.ts'
  import { areaColor, type AreaResult } from './data.ts'
  import { assignedVillagesInDistrict, type CityGeometry } from './geometry.ts'

  const {
    geometry,
    counterpart,
    frame,
    drilldown,
    results,
    showBackButton = false,
  }: {
    geometry: CityGeometry
    counterpart?: CityGeometry
    frame: TaiwanDistrictCollection
    drilldown: MapDrilldown<TaiwanDistrictCollection['features'][number]>
    showBackButton?: boolean
    results: Pick<
      CreateQueryResult<Map<string, AreaResult>>,
      'data' | 'isPending' | 'isError'
    >
  } = $props()

  const { districts, villages } = $derived(geometry)
  let mapWidth = $state(0)
  let mapHeight = $state(0)
  const focus = $derived(drilldown.focus)
  const districtVillages = $derived(
    assignedVillagesInDistrict(villages, drilldown.selectedKey),
  )
  const areas = $derived(
    focus
      ? districtVillages.map(({ properties }) => ({
          code: properties.villageCode,
          name: properties.name,
        }))
      : districts.features.map(({ properties }) => ({
          code: properties.districtCode,
          name: properties.name,
        })),
  )
  function areaName(code: string) {
    const name =
      areas.find((area) => area.code === code)?.name ??
      (focus
        ? counterpart?.villages.features.find(
            ({ properties }) => properties.villageCode === code,
          )?.properties.name
        : counterpart?.districts.features.find(
            ({ properties }) => properties.districtCode === code,
          )?.properties.name) ??
      code
    return (focus?.properties.name ?? '') + name
  }
</script>

<div
  class="map-frame"
  bind:clientWidth={mapWidth}
  bind:clientHeight={mapHeight}
>
  {#if showBackButton && focus}
    <button
      class="map-back"
      type="button"
      bind:this={drilldown.backButton}
      onclick={() => drilldown.reset()}
    >
      <svg viewBox="0 0 24 24" aria-hidden="true">
        <path
          d="M20 12H4m0 0 7-7m-7 7 7 7"
          fill="none"
          stroke="currentColor"
          stroke-width="2"
          stroke-linecap="round"
          stroke-linejoin="round"
        />
      </svg>
      <span>返回全市</span>
    </button>
  {/if}
  <D3DrilldownMap
    geometry={frame}
    width={mapWidth || 640}
    height={mapHeight || 540}
    padding={8}
    {drilldown}
    regions={districts.features.map(
      ({ properties: { districtCode, name }, geometry }) => ({
        key: districtCode,
        geometry,
        label: `查看${name}村里`,
        fill: `var(${areaColor(results.data?.get(districtCode))})`,
      }),
    )}
    details={districtVillages.map(
      ({ properties: { villageCode, name }, geometry }) => ({
        key: villageCode,
        geometry,
        label: `查看${name ?? villageCode}得票`,
        fill: `var(${areaColor(results.data?.get(villageCode))})`,
      }),
    )}
    containTooltip={counterpart !== undefined}
    tooltipTitle={areaName}
    label={focus ? `${focus.properties.name}村里地圖` : '行政區地圖'}
    style="background: var(--neutral-gray-100); position: absolute; inset: 0; width: 100%; height: 100%;
    --drilldown-context-fill: var(--elec-gray-1);
    --drilldown-outline-color: var(--elec-gray-4)"
  >
    {#snippet tooltip(code)}
      {@const area = areas.find((area) => area.code === code)}
      {@const result = results.data?.get(code)}
      {#if !area}
        <div>此年度無對應{focus ? '村里' : '行政區'}</div>
      {:else if result?.leader}
        {#if result.majorPartyCandidates.length}
          <TooltipRows
            rows={result.majorPartyCandidates.map((candidate) => ({
              label: candidate.姓名,
              color: `var(${resolvePartyColor(candidate.政黨.trim()).colorVar})`,
              value: `${formatNumber(candidate.得票數)}票（${candidate['得票率(%)'].text}%）`,
            }))}
          />
        {/if}
      {:else if results.isError}
        <div>無法載入開票資料。</div>
      {:else}
        <div>{results.isPending ? '開票資料載入中……' : '尚無開票結果'}</div>
      {/if}
    {/snippet}
  </D3DrilldownMap>
</div>

<style>
  .map-frame {
    position: relative;
    flex: 1 1 auto;
    aspect-ratio: 4 / 5;
    min-height: 144px;
    min-width: 0;
  }
  .map-back {
    position: absolute;
    top: 8px;
    left: 8px;
    z-index: 1;
    display: inline-flex;
    align-items: center;
    gap: 4px;
    padding: 0;
    border: 0;
    background: transparent;
    color: var(--text-color);
    font: inherit;
    font-size: var(--text-s);
    white-space: nowrap;
    cursor: pointer;
    -webkit-text-stroke: 3px var(--neutral-gray-100);
    paint-order: stroke fill;
  }
  .map-back svg {
    flex: none;
    width: 1em;
    height: 1em;
  }
  .map-back:hover span {
    text-decoration: underline;
  }
  @container (width < 600px) {
    .map-frame {
      flex: none;
      width: 100%;
    }
  }
  @container (width < 480px) {
    .map-back {
      font-size: var(--text-xs);
    }
  }
</style>
