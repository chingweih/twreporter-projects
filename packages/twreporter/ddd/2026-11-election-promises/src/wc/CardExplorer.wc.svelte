<svelte:options
  customElement={{
    tag: 'twreporter-card-explorer',
    props: {
      sources: { type: 'Object' },
      categoryId: { attribute: 'category-id', type: 'Number', reflect: true },
      topicId: { attribute: 'topic-id', type: 'String', reflect: true },
      city: { type: 'String', reflect: true },
    },
  }}
/>

<script lang="ts">
  import Layout from '@lab-reporter/ddd-shared/components/shared/Layout.svelte'
  import type { ExplorerProps } from '../lib/components/card-explorer/types.ts'
  import CardExplorer from './CardExplorer.svelte'

  let {
    sources,
    config = '',
    categoryId,
    topicId = '',
    city = '',
  }: Partial<ExplorerProps> = $props()
</script>

<Layout>
  <CardExplorer {sources} {config} {categoryId} bind:topicId bind:city />
</Layout>
