<script module lang="ts">
  import taiwanCounties from '@lab-reporter/ddd-atlas/taiwan/counties' with { type: 'json' }
  import taipeiDistricts from '@lab-reporter/ddd-atlas/taiwan/counties/63000/districts' with { type: 'json' }
  import {
    splitTaiwanCounties,
    type TaiwanDistrictCollection,
    type TaiwanVillageCollection,
  } from '@lab-reporter/ddd-atlas/taiwan/map'
  import { defineMeta } from '@storybook/addon-svelte-csf'
  import type { ComponentProps } from 'svelte'
  import { fromStore, readable } from 'svelte/store'
  import { MapDrilldown } from '../../utils/map-drilldown.svelte.ts'
  import D3DrilldownMap, { type DrilldownArea } from './D3DrilldownMap.svelte'
  import D3Map from './D3Map.svelte'

  const daanCode = '63000030'
  function districtAreas(districts: TaiwanDistrictCollection) {
    return districts.features.map(
      ({ geometry, properties: { districtCode, name } }) =>
        ({
          key: districtCode,
          geometry,
          label: name,
          fill: districtCode === daanCode ? '#92b5cb' : '#cadeeb',
        }) satisfies DrilldownArea,
    )
  }
  const taipei = districtAreas(taipeiDistricts)
  const daan = taipei.find((region) => region.key === daanCode)

  const { mainIsland, insets } = splitTaiwanCounties(taiwanCounties)
  const taiwan = {
    ...mainIsland,
    features: [
      ...mainIsland.features,
      ...insets.flatMap(({ geometry }) => geometry.features),
    ],
  }
  const counties = taiwan.features.map(
    ({ geometry, properties: { countyCode, name } }) =>
      ({
        key: countyCode,
        geometry,
        label: name,
        fill: '#cadeeb',
      }) satisfies DrilldownArea,
  )
  const districtFiles = import.meta.glob<TaiwanDistrictCollection>(
    '../../../../atlas/geometries/taiwan/2026/counties/*/districts.json',
    { import: 'default' },
  )
  const villageFiles = import.meta.glob<TaiwanVillageCollection>(
    '../../../../atlas/geometries/taiwan/2026/counties/*/villages.json',
    { import: 'default' },
  )

  type CountyMap = {
    districts: DrilldownArea[]
    villages: (DrilldownArea & { districtCode: string })[]
  }
  type CountyLoad =
    | { status: 'loading' | 'error' }
    | { status: 'ready'; map: CountyMap }

  const loadedCounties = new Map<string, CountyMap>()

  function loadCounty(countyCode: string) {
    return fromStore(
      readable<CountyLoad>({ status: 'loading' }, (set) => {
        const cached = loadedCounties.get(countyCode)
        if (cached) {
          set({ status: 'ready', map: cached })
          return
        }
        const directory = `../../../../atlas/geometries/taiwan/2026/counties/${countyCode}`
        const districts = districtFiles[`${directory}/districts.json`]
        const villages = villageFiles[`${directory}/villages.json`]
        if (!districts || !villages) {
          set({ status: 'error' })
          return
        }
        void Promise.all([districts(), villages()]).then(
          ([districtData, villageData]) => {
            const map = {
              districts: districtAreas(districtData),
              villages: villageData.features
                .filter(({ properties }) => !properties.unassigned)
                .map(({ geometry, properties }) => ({
                  key: properties.villageCode,
                  districtCode: properties.districtCode,
                  geometry,
                  label: properties.name ?? properties.villageCode,
                  fill: '#b5cfe2',
                })),
            }
            loadedCounties.set(countyCode, map)
            set({ status: 'ready', map })
          },
          () => set({ status: 'error' }),
        )
      }),
    )
  }

  const { Story } = defineMeta({
    title: 'Core/D3Map',
    component: D3Map,
    parameters: { layout: 'padded', controls: { include: ['padding'] } },
    render: template,
    args: {
      geometry: taipeiDistricts,
      width: 480,
      height: 300,
      padding: 24,
      label: 'Taipei district map',
    },
  })
</script>

{#snippet template(args: ComponentProps<typeof D3Map>)}
  <D3Map {...args}>
    {#snippet children(path)}
      {#each taipei as { key, geometry, label, fill } (key)}
        <path
          data-map-tooltip={label}
          d={path(geometry)}
          {fill}
          stroke="#fff"
          vector-effect="non-scaling-stroke"
        />
      {/each}
    {/snippet}
    {#snippet tooltip(region)}{region}{/snippet}
  </D3Map>
{/snippet}

<Story name="Overview" />
<Story name="Focused region" args={{ focus: daan?.geometry }} />
<Story name="Drill-down">
  {#snippet template({ width, padding })}
    {@const drilldown = new MapDrilldown(
      (key) =>
        counties.find((county) => county.key === key)?.geometry ??
        loadedCounties
          .get(key.slice(0, 5))
          ?.districts.find((district) => district.key === key)?.geometry,
    )}
    {@const [countyCode, districtCode] = drilldown.path}
    {@const loader = countyCode ? loadCounty(countyCode) : undefined}
    {@const county = loader?.current}
    {@const countyMap = county?.status === 'ready' ? county.map : undefined}
    {@const regions = countyCode ? (countyMap?.districts ?? []) : counties}
    {#if countyCode}
      <button
        type="button"
        bind:this={drilldown.backButton}
        onclick={() => drilldown.back()}
      >
        {districtCode ? 'Back to districts' : 'Back to Taiwan'}
      </button>
    {/if}
    {#if county?.status === 'loading'}
      <p role="status">Loading boundaries…</p>
    {:else if county?.status === 'error'}
      <p role="alert">Could not load boundaries.</p>
    {/if}
    <D3DrilldownMap
      geometry={taiwan}
      {width}
      height={430}
      {padding}
      {regions}
      {drilldown}
      parentKey={countyCode}
      details={countyMap?.villages.filter(
        (village) => village.districtCode === districtCode,
      ) ?? []}
      label="Taiwan administrative boundaries"
    >
      {#snippet tooltip(key)}
        {regions.find((region) => region.key === key)?.label ??
          countyMap?.villages.find((village) => village.key === key)?.label}
      {/snippet}
    </D3DrilldownMap>
  {/snippet}
</Story>
