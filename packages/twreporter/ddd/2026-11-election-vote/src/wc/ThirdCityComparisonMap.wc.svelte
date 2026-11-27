<svelte:options
  customElement={{
    tag: 'twreporter-2026-11-election-vote-third-city-comparison-map',
    props: { city: { type: 'String' } },
  }}
/>

<script lang="ts">
  import type { ComponentProps } from '@lab-reporter/ddd-shared/components/types.ts'
  import { thirdBatch, thirdComparisonMap } from '../lib/batches/third.ts'
  import { thirdCityGeometries } from '../lib/components/city-result-map/third-city-geometries.ts'
  import { thirdHistoricalGeometries } from '../lib/components/city-result-map/third-historical-geometries.ts'
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
    name={thirdComparisonMap}
    {config}
    {ratio}
    {city}
    geometries={thirdCityGeometries}
    historicalGeometries={thirdHistoricalGeometries}
  />
</ElectionLayout>
