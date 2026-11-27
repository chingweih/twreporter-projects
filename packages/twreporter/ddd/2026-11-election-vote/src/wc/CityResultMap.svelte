<script lang="ts">
  import type { ComponentProps } from '@lab-reporter/ddd-shared/components/types.ts'
  import { secondBatch } from '../lib/batches/second.ts'
  import CityDistrictMaps from '../lib/components/city-result-map/CityDistrictMaps.svelte'
  import { cityGeometries } from '../lib/components/city-result-map/geometry.ts'
  import ElectionCityGraphic from '../lib/ElectionCityGraphic.svelte'

  const {
    config,
    ratio,
    city,
  }: Pick<ComponentProps, 'config' | 'ratio'> & { city?: string } = $props()
</script>

<ElectionCityGraphic
  batch={secondBatch}
  name="city-result-map"
  {config}
  {ratio}
  {city}
  wide
  fitViewport
>
  {#snippet children(cityCode)}
    {@const geometry = cityGeometries.get(cityCode)}
    {#if geometry}
      {#key cityCode}
        <CityDistrictMaps current={geometry} />
      {/key}
    {:else}
      <p role="status">尚無此縣市的地圖資料。</p>
    {/if}
  {/snippet}
</ElectionCityGraphic>
