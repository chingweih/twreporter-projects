<script lang="ts">
  import taipeiDistricts from '@lab-reporter/ddd-atlas/taiwan/2022/counties/63000/districts' with { type: 'json' }
  import taipeiVillages from '@lab-reporter/ddd-atlas/taiwan/2022/counties/63000/villages' with { type: 'json' }
  import newTaipeiDistricts from '@lab-reporter/ddd-atlas/taiwan/2022/counties/65000/districts' with { type: 'json' }
  import newTaipeiVillages from '@lab-reporter/ddd-atlas/taiwan/2022/counties/65000/villages' with { type: 'json' }
  import type { ComponentProps } from '@lab-reporter/ddd-shared/components/types.ts'
  import { secondBatch } from '../lib/batches/second.ts'
  import type { HistoricalCityGeometry } from '../lib/components/city-result-map/data.ts'
  import { secondCityGeometries } from '../lib/components/city-result-map/second-city-geometries.ts'
  import { historicalElectionTabs } from '../lib/election-historical-data.ts'
  import CityElectionMap from './CityElectionMap.svelte'

  const {
    config,
    ratio,
    city,
  }: Pick<ComponentProps, 'config' | 'ratio'> & { city?: string } = $props()
  const previousGeometries = new Map<string, HistoricalCityGeometry>([
    [
      '63000',
      {
        districts: taipeiDistricts,
        villages: taipeiVillages,
        townshipResults: historicalElectionTabs.taipeiMayorByTownship,
        villageResults: historicalElectionTabs.taipeiMayorByVillage,
      },
    ],
    [
      '65000',
      {
        districts: newTaipeiDistricts,
        villages: newTaipeiVillages,
        townshipResults: historicalElectionTabs.newTaipeiMayorByTownship,
        villageResults: historicalElectionTabs.newTaipeiMayorByVillage,
      },
    ],
  ])
</script>

<CityElectionMap
  batch={secondBatch}
  name="city-comparison-map"
  {config}
  {ratio}
  {city}
  wide={true}
  geometries={secondCityGeometries}
  historicalGeometries={previousGeometries}
/>
