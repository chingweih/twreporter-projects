<script lang="ts">
  import EmbedCode from '@lab-reporter/ddd-shared/components/shared/EmbedCode.svelte'
  import GraphicData from '@lab-reporter/ddd-shared/components/shared/GraphicData.svelte'
  import type { Snippet } from 'svelte'
  import {
    electionComponentPrefix,
    type ElectionBatch,
    type ElectionGraphicKey,
  } from './batch-config.ts'
  import ElectionLayout from './ElectionLayout.svelte'

  const {
    batch,
    config,
    children,
  }: {
    batch: ElectionBatch
    config: string
    children: Snippet<[ElectionGraphicKey]>
  } = $props()
</script>

<ElectionLayout>
  <GraphicData
    name={batch.name}
    schema={batch.schema}
    context={batch.context}
    {config}
  >
    {#each batch.graphics as { key, name } (key)}
      {@render children(key)}
      <EmbedCode
        componentName={name}
        tagName={`${electionComponentPrefix}-${name}`}
        previewStoryId={batch.previewStoryId}
        {config}
      />
    {/each}
  </GraphicData>
</ElectionLayout>
