<script lang="ts">
  import type { ComponentProps } from '@lab-reporter/ddd-shared/components/types.ts'
  import { secondBatch } from '../lib/batches/second.ts'
  import { secondCityGeometries } from '../lib/components/city-result-map/second-city-geometries.ts'
  import CityElectionMap from './CityElectionMap.svelte'

  const {
    config,
    ratio,
    city,
  }: Pick<ComponentProps, 'config' | 'ratio'> & { city?: string } = $props()
</script>

<CityElectionMap
  batch={secondBatch}
  name="city-result-map"
  {config}
  {ratio}
  {city}
  geometries={secondCityGeometries}
/>
