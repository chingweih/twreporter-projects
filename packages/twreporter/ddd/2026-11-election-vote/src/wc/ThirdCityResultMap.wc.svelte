<svelte:options
  customElement={{
    tag: 'twreporter-2026-11-election-vote-third-city-result-map',
    props: { city: { type: 'String' } },
  }}
/>

<script lang="ts">
  import type { ComponentProps } from '@lab-reporter/ddd-shared/components/types.ts'
  import { thirdBatch, thirdResultMap } from '../lib/batches/third.ts'
  import { thirdCityGeometries } from '../lib/components/city-result-map/third-city-geometries.ts'
  import ElectionLayout from '../lib/ElectionLayout.svelte'
  import CityElectionMap from './CityElectionMap.svelte'

  const {
    config,
    ratio,
    city,
  }: Pick<ComponentProps, 'config' | 'ratio'> & { city?: string } = $props()
</script>

<ElectionLayout>
  <CityElectionMap
    batch={thirdBatch}
    name={thirdResultMap}
    {config}
    {ratio}
    {city}
    geometries={thirdCityGeometries}
  />
</ElectionLayout>
