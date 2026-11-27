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

<script module lang="ts">
  import Layout, {
    createLayoutQueryClient,
  } from '@lab-reporter/ddd-shared/components/shared/Layout.svelte'

  const queryClient = createLayoutQueryClient()
</script>

<script lang="ts">
  import type { ExplorerProps } from '../lib/components/card-explorer/types.ts'
  import PromiseCards from '../lib/components/card-explorer/PromiseCards.svelte'

  let {
    sources,
    config = '',
    ratio,
    categoryId,
    topicId = '',
    city = '',
    full = 'false',
  }: Partial<ExplorerProps> & { full?: 'true' | 'false' } = $props()
</script>

<Layout hideInEditor {queryClient}>
  <PromiseCards
    {sources}
    {config}
    {ratio}
    bind:categoryId
    bind:topicId
    bind:city
    full={full === 'true'}
  />
</Layout>
