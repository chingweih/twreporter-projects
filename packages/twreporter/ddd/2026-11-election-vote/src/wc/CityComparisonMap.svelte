<script lang="ts">
  import taipeiDistricts from '@lab-reporter/ddd-atlas/taiwan/2022/counties/63000/districts' with { type: 'json' }
  import taipeiVillages from '@lab-reporter/ddd-atlas/taiwan/2022/counties/63000/villages' with { type: 'json' }
  import newTaipeiDistricts from '@lab-reporter/ddd-atlas/taiwan/2022/counties/65000/districts' with { type: 'json' }
  import newTaipeiVillages from '@lab-reporter/ddd-atlas/taiwan/2022/counties/65000/villages' with { type: 'json' }
  import type { ComponentProps } from '@lab-reporter/ddd-shared/components/types.ts'
  import { secondBatch } from '../lib/batches/second.ts'
  import CityDistrictMaps from '../lib/components/city-result-map/CityDistrictMaps.svelte'
  import {
    cityGeometries,
    type CityGeometry,
  } from '../lib/components/city-result-map/geometry.ts'
  import ElectionCityGraphic from '../lib/ElectionCityGraphic.svelte'

  const { config, city }: Pick<ComponentProps, 'config'> & { city?: string } =
    $props()
  const previousGeometries = new Map<string, CityGeometry>([
    ['63000', { districts: taipeiDistricts, villages: taipeiVillages }],
    ['65000', { districts: newTaipeiDistricts, villages: newTaipeiVillages }],
  ])
</script>

<ElectionCityGraphic
  batch={secondBatch}
  name="city-comparison-map"
  {config}
  {city}
  wide
  fitViewport
>
  {#snippet children(cityCode)}
    {@const current = cityGeometries.get(cityCode)}
    {@const previous = previousGeometries.get(cityCode)}
    {#if current && previous}
      {#key cityCode}
        <CityDistrictMaps {current} {previous} />
      {/key}
    {:else}
      <p role="status">尚無此縣市的地圖資料。</p>
    {/if}
  {/snippet}
</ElectionCityGraphic>
