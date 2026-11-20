<script module lang="ts">
  import Layout from '@lab-reporter/ddd-shared/components/shared/Layout.svelte'
  import GraphicData from '@lab-reporter/ddd-shared/components/shared/GraphicData.svelte'
  import EmbedCode from '@lab-reporter/ddd-shared/components/shared/EmbedCode.svelte'
  import Shell from '@lab-reporter/ddd-shared/components/shared/Shell.svelte'
  import { defineMeta } from '@storybook/addon-svelte-csf'
  import CardExplorer from './CardExplorer.wc.svelte'
  import CitySelector from './CitySelector.wc.svelte'
  import { cardExplorerConfigSchema } from '../lib/components/card-explorer/types.ts'
  import { cardExplorerGraphicContext } from '../lib/components/card-explorer/graphic-context.ts'

  const { Story } = defineMeta({
    title: 'Components/CardExplorer',
    component: CardExplorer,
    args: {
      sources: {
        answers: './card-explorer-answers.csv',
        reviews: './card-explorer-reviews.csv',
      },
      config: './card-explorer.json',
      city: '台北市',
    },
    argTypes: {
      sources: { control: 'object' },
      config: { control: 'text' },
      categoryId: { control: false },
      topicId: { control: false },
      city: { control: 'text' },
    },
  })
</script>

<Story name="Default">
  {#snippet template(args)}
    <Layout>
      <CitySelector />
      <EmbedCode
        componentName="city-selector"
        tagName="twreporter-city-selector"
        config=""
      />
      <GraphicData
        name="twreporter-card-explorer"
        schema={cardExplorerConfigSchema}
        context={cardExplorerGraphicContext}
        config={args.config ?? ''}
        sources={args.sources}
      >
        {#snippet children(graphic)}
          {#if graphic.config}
            {#each graphic.config.categories as category (category.id)}
              {@const topicId = category.topics[0]?.id ?? ''}
              <CardExplorer {...args} categoryId={category.id} {topicId} />
              <EmbedCode
                componentName="card-explorer"
                tagName="twreporter-card-explorer"
                sources={args.sources}
                config={args.config ?? ''}
                extraProps={{
                  'category-id': category.id,
                  'topic-id': topicId,
                  city: args.city ?? '',
                }}
              />
            {/each}
          {:else}
            <Shell error={graphic.error} loading={graphic.loading} />
          {/if}
        {/snippet}
      </GraphicData>
    </Layout>
  {/snippet}
</Story>
