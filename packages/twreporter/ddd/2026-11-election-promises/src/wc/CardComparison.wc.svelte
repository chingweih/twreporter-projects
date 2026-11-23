<svelte:options
  customElement={{
    tag: 'twreporter-card-comparison',
    props: {
      sources: { type: 'Object' },
      categoryId: { attribute: 'category-id', type: 'Number', reflect: true },
      topicId: { attribute: 'topic-id', type: 'String', reflect: true },
    },
  }}
/>

<script lang="ts">
  import Layout from '@lab-reporter/ddd-shared/components/shared/Layout.svelte'
  import PromiseCards from '../lib/components/card-explorer/PromiseCards.svelte'
  import type { ExplorerProps } from '../lib/components/card-explorer/types.ts'

  let {
    sources,
    config = '',
    categoryId,
    topicId = '',
  }: Partial<Omit<ExplorerProps, 'city'>> = $props()
</script>

<Layout hideInEditor>
  <PromiseCards comparison {sources} {config} {categoryId} bind:topicId />
</Layout>
