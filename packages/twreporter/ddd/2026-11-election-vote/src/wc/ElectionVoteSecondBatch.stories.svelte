<script module lang="ts">
  import { defineMeta } from '@storybook/addon-svelte-csf'
  import { secondBatch } from '../lib/batches/second.ts'
  import ElectionBatchPreview from '../lib/ElectionBatchPreview.svelte'
  import ElectionCityGraphic from '../lib/ElectionCityGraphic.svelte'
  import ElectionGraphic from '../lib/ElectionGraphic.svelte'
  import CityComparisonMap from './CityComparisonMap.svelte'
  import CityResultMap from './CityResultMap.svelte'
  import CityTurnout from './CityTurnout.svelte'
  import CouncilChart from './CouncilChart.svelte'
  import Hualien from './Hualien.svelte'
  import TaipeiMobilization from './TaipeiMobilization.svelte'

  const { Story } = defineMeta({
    title: 'Components/ElectionVoteSecondBatch',
    args: { config: secondBatch.configUrl },
    argTypes: { config: { control: 'text' } },
  })
</script>

<Story name="Default">
  {#snippet template({ config })}
    <ElectionBatchPreview batch={secondBatch} {config}>
      {#snippet children({ key, name, city })}
        {#if name === 'city-turnout'}
          <CityTurnout {config} />
        {:else if name === 'taipei-turnout'}
          <CityTurnout {config} taipei />
        {:else if name === 'city-mobilization'}
          <TaipeiMobilization {config} {city} />
        {:else if name === 'city-council-party'}
          <CouncilChart {config} kind="party" />
        {:else if name === 'council-age'}
          <CouncilChart {config} kind="age" />
        {:else if name === 'council-sex'}
          <CouncilChart {config} kind="sex" />
        {:else if name === 'hualien'}
          <Hualien {config} />
        {:else if name === 'city-result-map'}
          <CityResultMap {config} {city} />
        {:else if name === 'city-comparison-map'}
          <CityComparisonMap {config} {city} />
        {:else if city !== undefined}
          <ElectionCityGraphic batch={secondBatch} {config} {name} {city} />
        {:else}
          <ElectionGraphic batch={secondBatch} {config} graphicKey={key} />
        {/if}
      {/snippet}
    </ElectionBatchPreview>
  {/snippet}
</Story>
