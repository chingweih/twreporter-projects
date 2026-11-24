<script lang="ts">
  import EmbedCode from '@lab-reporter/ddd-shared/components/shared/EmbedCode.svelte'
  import GraphicData from '@lab-reporter/ddd-shared/components/shared/GraphicData.svelte'
  import type { Snippet } from 'svelte'
  import {
    electionComponentPrefix,
    type ElectionBatch,
    type ElectionBatchGraphic,
  } from './batch-config.ts'
  import ElectionLayout from './ElectionLayout.svelte'

  const {
    batch,
    config,
    children,
  }: {
    batch: ElectionBatch
    config: string
    children: Snippet<[ElectionBatchGraphic]>
  } = $props()
</script>

<ElectionLayout>
  <GraphicData
    name={batch.name}
    schema={batch.schema}
    context={batch.context}
    {config}
  >
    {#each batch.graphics as graphic (graphic.key)}
      {@render children(graphic)}
      <EmbedCode
        componentName={graphic.name}
        tagName={`${electionComponentPrefix}-${graphic.name}`}
        previewStoryId={batch.previewStoryId}
        {config}
        extraProps={graphic.city === undefined
          ? undefined
          : { city: graphic.city }}
      />
    {/each}
  </GraphicData>
</ElectionLayout>
