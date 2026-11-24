<script module lang="ts">
  import { defineMeta } from '@storybook/addon-svelte-csf'
  import { secondBatch } from '../lib/batches/second.ts'
  import ElectionBatchPreview from '../lib/ElectionBatchPreview.svelte'
  import ElectionCityGraphic from '../lib/ElectionCityGraphic.svelte'
  import ElectionGraphic from '../lib/ElectionGraphic.svelte'

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
        {#if city !== undefined}
          <ElectionCityGraphic batch={secondBatch} {config} {name} {city} />
        {:else}
          <ElectionGraphic batch={secondBatch} {config} graphicKey={key} />
        {/if}
      {/snippet}
    </ElectionBatchPreview>
  {/snippet}
</Story>
