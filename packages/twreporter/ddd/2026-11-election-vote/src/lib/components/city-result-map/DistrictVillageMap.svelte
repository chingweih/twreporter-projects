<script lang="ts">
  import type { TaiwanDistrictCollection } from '@lab-reporter/ddd-atlas/taiwan/map'
  import D3DrilldownMap from '@lab-reporter/ddd-shared/components/shared/D3DrilldownMap.svelte'
  import { formatNumber } from '@lab-reporter/ddd-shared/utils/format.ts'
  import type { MapDrilldown } from '@lab-reporter/ddd-shared/utils/map-drilldown.svelte.ts'
  import type { CreateQueryResult } from '@tanstack/svelte-query'
  import { areaColor, type AreaResult } from './data.ts'
  import { assignedVillagesInDistrict, type CityGeometry } from './geometry.ts'

  const {
    geometry,
    counterpart,
    frame,
    drilldown,
    results,
  }: {
    geometry: CityGeometry
    counterpart?: CityGeometry
    frame: TaiwanDistrictCollection
    drilldown: MapDrilldown<TaiwanDistrictCollection['features'][number]>
    results: Pick<
      CreateQueryResult<Map<string, AreaResult>>,
      'data' | 'isPending' | 'isError'
    >
  } = $props()

  const { districts, villages } = $derived(geometry)
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
</script>

<D3DrilldownMap
  geometry={frame}
  width={640}
  height={540}
  padding={24}
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
  label={focus ? `${focus.properties.name}村里地圖` : '行政區地圖'}
  style="background: var(--neutral-gray-100); min-height: 0; flex: 1 1 auto;
    --drilldown-context-fill: var(--elec-grayscale-1);
    --drilldown-outline-color: var(--elec-grayscale-4)"
>
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
</D3DrilldownMap>

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
</style>
