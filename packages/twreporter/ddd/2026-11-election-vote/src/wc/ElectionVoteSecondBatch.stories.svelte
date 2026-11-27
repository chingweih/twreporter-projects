<script module lang="ts">
  import { defineMeta } from '@storybook/addon-svelte-csf'
  import { secondBatch } from '../lib/batches/second.ts'
  import ElectionBatchPreview from '../lib/ElectionBatchPreview.svelte'
  import ElectionCityGraphic from '../lib/ElectionCityGraphic.svelte'
  import ElectionGraphic from '../lib/ElectionGraphic.svelte'
  import CityComparisonMap from './CityComparisonMap.svelte'
  import CityResultMap from './CityResultMap.svelte'
  import CityTurnout from '../lib/components/line-chart/CityTurnout.svelte'
  import CouncilChart from '../lib/components/bar-chart/CouncilChart.svelte'
  import Hualien from '../lib/components/line-chart/Hualien.svelte'
  import TaipeiPartyScatter from '../lib/components/scatter-chart/TaipeiPartyScatter.svelte'
  import TppGogo from '../lib/components/nomination-units/TppGogo.svelte'
  import TaipeiMobilization from '../lib/components/line-chart/TaipeiMobilization.svelte'

  const { Story } = defineMeta({
    title: 'Components/ElectionVoteSecondBatch',
    args: { ratio: undefined, config: secondBatch.configUrl },
    argTypes: { ratio: { control: 'number' }, config: { control: 'text' } },
  })
</script>

<Story name="Default">
  {#snippet template({ config, ratio })}
    <ElectionBatchPreview batch={secondBatch} {config} {ratio}>
      {#snippet children({ key, name, city })}
        {#if name === 'city-turnout'}
          <CityTurnout {config} {ratio} />
        {:else if name === 'taipei-turnout'}
          <CityTurnout {config} {ratio} taipei />
        {:else if name === 'city-mobilization'}
          <TaipeiMobilization {config} {ratio} {city} />
        {:else if name === 'city-council-party'}
          <CouncilChart {config} {ratio} kind="party" />
        {:else if name === 'council-age'}
          <CouncilChart {config} {ratio} kind="age" />
        {:else if name === 'council-sex'}
          <CouncilChart {config} {ratio} kind="sex" />
        {:else if name === 'hualien'}
          <Hualien {config} {ratio} />
        {:else if name === 'taipei-party-scatter'}
          <TaipeiPartyScatter {config} {ratio} />
        {:else if name === 'tpp-gogo'}
          <TppGogo {config} {ratio} />
        {:else if name === 'city-result-map'}
          <CityResultMap {config} {ratio} {city} />
        {:else if name === 'city-comparison-map'}
          <CityComparisonMap {config} {ratio} {city} />
        {:else if city !== undefined}
          <ElectionCityGraphic
            batch={secondBatch}
            {config}
            {ratio}
            {name}
            {city}
          />
        {:else}
          <ElectionGraphic
            batch={secondBatch}
            {config}
            {ratio}
            graphicKey={key}
          />
        {/if}
      {/snippet}
    </ElectionBatchPreview>
  {/snippet}
</Story>
