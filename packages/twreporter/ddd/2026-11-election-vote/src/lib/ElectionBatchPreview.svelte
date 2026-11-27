<script lang="ts">
  import EmbedCode from '@lab-reporter/ddd-shared/components/shared/EmbedCode.svelte'
  import GraphicData from '@lab-reporter/ddd-shared/components/shared/GraphicData.svelte'
  import type { ComponentProps } from '@lab-reporter/ddd-shared/components/types.ts'
  import type { Snippet } from 'svelte'
  import { components } from '../../components.config.ts'
  import {
    electionComponentPrefix,
    type ElectionBatch,
    type ElectionBatchGraphic,
  } from './batch-config.ts'
  import ElectionLayout from './ElectionLayout.svelte'

  const {
    batch,
    config,
    ratio,
    children,
  }: Pick<ComponentProps, 'config' | 'ratio'> & {
    batch: ElectionBatch
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
        version={components[graphic.name].version}
        tagName={`${electionComponentPrefix}-${graphic.name}`}
        previewStoryId={batch.previewStoryId}
        {config}
        {ratio}
        extraProps={graphic.city === undefined
          ? undefined
          : { city: graphic.city }}
      />
    {/each}
  </GraphicData>
</ElectionLayout>
