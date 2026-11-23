<script module lang="ts">
  import Layout from '@lab-reporter/ddd-shared/components/shared/Layout.svelte'
  import GraphicData from '@lab-reporter/ddd-shared/components/shared/GraphicData.svelte'
  import EmbedCode from '@lab-reporter/ddd-shared/components/shared/EmbedCode.svelte'
  import Shell from '@lab-reporter/ddd-shared/components/shared/Shell.svelte'
  import { defineMeta } from '@storybook/addon-svelte-csf'
  import CardComparison from './CardComparison.wc.svelte'
  import CardExplorer from './CardExplorer.wc.svelte'
  import CitySelector from './CitySelector.wc.svelte'
  import { cardExplorerGraphic } from '../lib/components/card-explorer/graphic-context.ts'

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
        {...cardExplorerGraphic}
        config={args.config ?? ''}
        sources={args.sources}
      >
        {#snippet children(graphic)}
          {#if graphic.config}
            {@const categories = graphic.config.categories}
            {#snippet categoryCards(comparison: boolean)}
              {@const componentName = comparison
                ? 'card-comparison'
                : 'card-explorer'}
              {@const tagName = `twreporter-${componentName}`}
              {#each categories as category (category.id)}
                {@const topic = category.topics[0]}
                {@const topicId = topic?.id ?? ''}
                {@const props = {
                  sources: args.sources,
                  config: args.config,
                  categoryId: category.id,
                  topicId,
                }}
                {#if comparison}
                  <CardComparison {...props} />
                {:else}
                  <CardExplorer {...props} city={args.city} />
                {/if}
                <EmbedCode
                  {componentName}
                  {tagName}
                  sources={args.sources}
                  config={args.config ?? ''}
                  extraProps={{
                    'category-id': category.id,
                    'topic-id': topicId,
                    ...(!comparison && { city: args.city ?? '' }),
                  }}
                />
              {/each}
            {/snippet}
            {@render categoryCards(false)}
            {@render categoryCards(true)}
          {:else}
            <Shell error={graphic.error} loading={graphic.loading} />
          {/if}
        {/snippet}
      </GraphicData>
    </Layout>
  {/snippet}
</Story>
