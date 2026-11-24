<script module lang="ts">
  import { defineMeta } from '@storybook/addon-svelte-csf'
  import { firstBatch } from '../lib/batches/first.ts'
  import ElectionBatchPreview from '../lib/ElectionBatchPreview.svelte'
  import ElectionGraphic from '../lib/ElectionGraphic.svelte'
  import CityMap from './CityMap.svelte'

  const { Story } = defineMeta({
    title: 'Components/ElectionVote',
    component: CityMap,
    args: { config: firstBatch.configUrl },
    argTypes: {
      config: { control: 'text' },
      tiles: { control: false },
    },
  })
</script>

<Story name="Default">
  {#snippet template({ config })}
    <ElectionBatchPreview batch={firstBatch} {config}>
      {#snippet children({ key })}
        {#if key === '1-city-map'}
          <CityMap {config} />
        {:else}
          <ElectionGraphic batch={firstBatch} {config} graphicKey={key} />
        {/if}
      {/snippet}
    </ElectionBatchPreview>
  {/snippet}
</Story>
