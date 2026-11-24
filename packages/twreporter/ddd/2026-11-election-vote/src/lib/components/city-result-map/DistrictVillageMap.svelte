<script lang="ts">
  import type { TaiwanDistrictCollection } from '@lab-reporter/ddd-atlas/taiwan/map'
  import D3Map, {
    type MapTooltipTarget,
  } from '@lab-reporter/ddd-shared/components/shared/D3Map.svelte'
  import { formatNumber } from '@lab-reporter/ddd-shared/utils/format.ts'
  import type { CreateQueryResult } from '@tanstack/svelte-query'
  import { areaColor, type AreaResult } from './data.ts'
  import { assignedVillagesInDistrict, type CityGeometry } from './geometry.ts'

  const width = 640
  const height = 540
  const padding = 24
  const tooltipId = $props.id()
  let {
    geometry,
    counterpart,
    frame,
    focus,
    onselect,
    onreset,
    results,
    tooltipTarget = $bindable(),
  }: {
    geometry: CityGeometry
    counterpart?: CityGeometry
    frame: TaiwanDistrictCollection
    focus?: TaiwanDistrictCollection['features'][number]
    onselect: (code: string, button: SVGPathElement) => void
    onreset: () => void
    results: Pick<
      CreateQueryResult<Map<string, AreaResult>>,
      'data' | 'isPending' | 'isError'
    >
    tooltipTarget?: MapTooltipTarget
  } = $props()

  const { districts, villages } = $derived(geometry)
  const districtCode = $derived(focus?.properties.districtCode)
  const district = $derived(
    districts.features.find(
      (feature) => feature.properties.districtCode === districtCode,
    ),
  )
  const districtVillages = $derived(
    assignedVillagesInDistrict(villages, districtCode),
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

  function showVillageTooltip(key: string, path: SVGPathElement) {
    if (!path.ownerSVGElement) return
    tooltipTarget = { key, focus, source: path.ownerSVGElement }
  }
</script>

<D3Map
  geometry={frame}
  {width}
  {height}
  {padding}
  {focus}
  bind:tooltipTarget
  {tooltipId}
  containTooltip={counterpart !== undefined}
  onbackgroundclick={focus ? onreset : undefined}
  label={focus ? `${focus.properties.name}村里地圖` : '行政區地圖'}
  style="background: var(--neutral-gray-100); min-height: 0; flex: 1 1 auto"
>
  {#snippet children(path)}
    <g class:inactive={Boolean(focus)} aria-hidden={focus ? true : undefined}>
      {#each districts.features as { properties: area, geometry } (area.districtCode)}
        <path
          class="district"
          d={path(geometry)}
          fill="var({areaColor(results.data?.get(area.districtCode))})"
          data-map-tooltip={focus ? undefined : area.districtCode}
          role="button"
          tabindex={focus ? -1 : 0}
          aria-label={`查看${area.name}村里`}
          aria-describedby={tooltipTarget?.key === area.districtCode && !focus
            ? tooltipId
            : undefined}
          onclick={(event) => onselect(area.districtCode, event.currentTarget)}
          onkeydown={(event) => {
            if (event.key !== 'Enter' && event.key !== ' ') return
            event.preventDefault()
            onselect(area.districtCode, event.currentTarget)
          }}
        />
      {/each}
    </g>
    {#each districtVillages as { properties: village, geometry } (village.villageCode)}
      <path
        class="village"
        d={path(geometry)}
        fill="var({areaColor(results.data?.get(village.villageCode))})"
        data-map-tooltip={village.villageCode}
        role="button"
        tabindex="0"
        aria-label={`查看${village.name ?? village.villageCode}得票`}
        aria-describedby={tooltipTarget?.key === village.villageCode
          ? tooltipId
          : undefined}
        onclick={(event) =>
          showVillageTooltip(village.villageCode, event.currentTarget)}
        onkeydown={(event) => {
          if (event.key !== 'Enter' && event.key !== ' ') return
          event.preventDefault()
          showVillageTooltip(village.villageCode, event.currentTarget)
        }}
      />
    {/each}
    {#if district}
      <path class="outline" d={path(district)} />
    {/if}
  {/snippet}
  {#snippet tooltip(code)}
    {@const area = areas.find((area) => area.code === code)}
    {@const counterpartName = area
      ? undefined
      : focus
        ? counterpart?.villages.features.find(
            ({ properties }) => properties.villageCode === code,
          )?.properties.name
        : counterpart?.districts.features.find(
            ({ properties }) => properties.districtCode === code,
          )?.properties.name}
    {@const result = results.data?.get(code)}
    <strong
      >{(focus?.properties.name ?? '') +
        (area?.name ?? counterpartName ?? code)}</strong
    >
    {#if !area}
      <div>此年度無對應{focus ? '村里' : '行政區'}</div>
    {:else if result}
      {#if result.tied}
        <div>最高票同票</div>
      {:else}
        {@const { leader } = result}
        <div>{leader.姓名}（{leader.政黨.trim() || '未提供政黨'}）領先</div>
      {/if}
      {#if result.majorPartyCandidates.length}
        <hr />
        <ul class="candidate-votes">
          {#each result.majorPartyCandidates as candidate (candidate.號次)}
            <li>
              {candidate.姓名}
              {formatNumber(candidate.得票數)}票（{formatNumber(
                candidate['得票率(%)'],
              )}%）
            </li>
          {/each}
        </ul>
      {/if}
    {:else if results.isError}
      <div>無法載入開票資料。</div>
    {:else}
      <div>{results.isPending ? '開票資料載入中……' : '尚無開票結果'}</div>
    {/if}
  {/snippet}
</D3Map>

<style>
  hr {
    margin: 4px 0;
    border: 0;
    border-top: 1px solid var(--neutral-gray-600);
  }

  .candidate-votes {
    margin: 0;
    padding: 0;
    font-size: 0.85em;
    list-style: none;
  }

  .district:focus,
  .village:focus {
    outline: none;
  }

  path {
    stroke: var(--neutral-white);
    stroke-width: 1;
    vector-effect: non-scaling-stroke;
  }

  .district {
    cursor: pointer;
  }

  .district:hover,
  .district:focus-visible,
  .village:hover,
  .village:focus-visible {
    filter: brightness(0.86);
  }

  .inactive {
    pointer-events: none;
  }

  .inactive .district {
    fill: var(--elec-grayscale-1);
  }

  .outline {
    fill: none;
    stroke: var(--elec-grayscale-4);
    pointer-events: none;
  }
</style>
