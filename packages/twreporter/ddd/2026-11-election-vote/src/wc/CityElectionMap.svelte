<script lang="ts">
  import type { ComponentProps } from '@lab-reporter/ddd-shared/components/types.ts'
  import type { ElectionBatch } from '../lib/batch-config.ts'
  import CityDistrictMaps from '../lib/components/city-result-map/CityDistrictMaps.svelte'
  import type { HistoricalCityGeometry } from '../lib/components/city-result-map/data.ts'
  import type { CityGeometry } from '../lib/components/city-result-map/geometry.ts'
  import ElectionCityGraphic from '../lib/ElectionCityGraphic.svelte'

  const {
    batch,
    name,
    config,
    wide,
    ratio,
    city,
    geometries,
    historicalGeometries,
  }: Pick<ComponentProps, 'config' | 'ratio'> & {
    batch: ElectionBatch
    name: string
    city?: string
    wide?: boolean
    geometries: ReadonlyMap<string, CityGeometry>
    historicalGeometries?: ReadonlyMap<string, HistoricalCityGeometry>
  } = $props()
</script>

<ElectionCityGraphic {batch} {name} {config} {ratio} {city} {wide} fitViewport>
  {#snippet children(cityCode)}
    {@const current = geometries.get(cityCode)}
    {@const previous = historicalGeometries?.get(cityCode)}
    {#if current && (!historicalGeometries || previous)}
      {#key cityCode}
        <CityDistrictMaps {current} {previous} />
      {/key}
    {:else}
      <p role="status">尚無此縣市的地圖資料。</p>
    {/if}
  {/snippet}
</ElectionCityGraphic>
