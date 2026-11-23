<svelte:options
  customElement={{
    tag: 'twreporter-card-explorer',
    props: {
      sources: { type: 'Object' },
      categoryId: { attribute: 'category-id', type: 'Number', reflect: true },
      topicId: { attribute: 'topic-id', type: 'String', reflect: true },
      city: { type: 'String', reflect: true },
      full: { type: 'String' },
    },
  }}
/>

<script lang="ts">
  import Layout from '@lab-reporter/ddd-shared/components/shared/Layout.svelte'
  import type { ExplorerProps } from '../lib/components/card-explorer/types.ts'
  import PromiseCards from '../lib/components/card-explorer/PromiseCards.svelte'

  let {
    sources,
    config = '',
    categoryId,
    topicId = '',
    city = '',
    full = 'false',
  }: Partial<ExplorerProps> & { full?: 'true' | 'false' } = $props()
</script>

<Layout hideInEditor>
  <PromiseCards
    {sources}
    {config}
    bind:categoryId
    bind:topicId
    bind:city
    full={full === 'true'}
  />
</Layout>
