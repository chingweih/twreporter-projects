<script module lang="ts">
  import { defineMeta } from '@storybook/addon-svelte-csf'
  import { thirdBatch, thirdComparisonMap } from '../lib/batches/third.ts'
  import { thirdCityGeometries } from '../lib/components/city-result-map/third-city-geometries.ts'
  import { thirdHistoricalGeometries } from '../lib/components/city-result-map/third-historical-geometries.ts'
  import ElectionBatchPreview from '../lib/ElectionBatchPreview.svelte'
  import CityElectionMap from './CityElectionMap.svelte'

  const { Story } = defineMeta({
    title: 'Components/ElectionVoteThirdBatch',
    args: { ratio: undefined, config: thirdBatch.configUrl },
    argTypes: { ratio: { control: 'number' }, config: { control: 'text' } },
  })
</script>

<Story name="Default">
  {#snippet template({ config, ratio })}
    <ElectionBatchPreview batch={thirdBatch} {config} {ratio}>
      {#snippet children({ name, city })}
        <CityElectionMap
          batch={thirdBatch}
          {name}
          {config}
          {ratio}
          {city}
          geometries={thirdCityGeometries}
          historicalGeometries={name === thirdComparisonMap
            ? thirdHistoricalGeometries
            : undefined}
        />
      {/snippet}
    </ElectionBatchPreview>
  {/snippet}
</Story>
