<script module lang="ts">
  import { defineMeta } from '@storybook/addon-svelte-csf'
  import { firstBatch } from '../lib/batches/first.ts'
  import ElectionBatchPreview from '../lib/ElectionBatchPreview.svelte'
  import ElectionGraphic from '../lib/ElectionGraphic.svelte'
  import CityMap from './CityMap.svelte'
  import CityGrid from '../lib/components/city-grid/CityGrid.svelte'
  import PartyCityResult from '../lib/components/bar-chart/PartyCityResult.svelte'
  import RefResult from '../lib/components/bar-chart/RefResult.svelte'

  const { Story } = defineMeta({
    title: 'Components/ElectionVote',
    component: CityMap,
    args: { ratio: undefined, config: firstBatch.configUrl },
    argTypes: {
      ratio: { control: 'number' },
      config: { control: 'text' },
      tiles: { control: false },
    },
  })
</script>

<Story name="Default">
  {#snippet template({ config, ratio })}
    <ElectionBatchPreview batch={firstBatch} {config} {ratio}>
      {#snippet children({ key })}
        {#if key === '1-city-map'}
          <CityMap {config} {ratio} />
        {:else if key === '2-city-grid'}
          <CityGrid {config} {ratio} />
        {:else if key === '3-party-city-result'}
          <PartyCityResult {config} {ratio} />
        {:else if key === '4-ref-result'}
          <RefResult {config} {ratio} />
        {:else}
          <ElectionGraphic
            batch={firstBatch}
            {config}
            {ratio}
            graphicKey={key}
          />
        {/if}
      {/snippet}
    </ElectionBatchPreview>
  {/snippet}
</Story>
