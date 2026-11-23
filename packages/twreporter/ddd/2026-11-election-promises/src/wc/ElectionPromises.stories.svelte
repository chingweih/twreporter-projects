<script module lang="ts">
  import { defineMeta } from '@storybook/addon-svelte-csf'
  import Layout from '@lab-reporter/ddd-shared/components/shared/Layout.svelte'
  import GraphicData from '@lab-reporter/ddd-shared/components/shared/GraphicData.svelte'
  import EmbedCode from '@lab-reporter/ddd-shared/components/shared/EmbedCode.svelte'
  import Shell from '@lab-reporter/ddd-shared/components/shared/Shell.svelte'
  import CardComparison from './CardComparison.wc.svelte'
  import CardExplorer from './CardExplorer.wc.svelte'
  import CitySelector from './CitySelector.wc.svelte'
  import { cardExplorerGraphic } from '../lib/components/card-explorer/graphic-context.ts'

  const previewStoryId = 'components-electionpromises--default'
  const { Story } = defineMeta({
    title: 'Components/ElectionPromises',
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
      full: { control: false },
    },
  })
</script>

<Story name="Default">
  {#snippet template({ sources, config = '', city = '台北市' })}
    <Layout>
      <CitySelector />
      <EmbedCode
        componentName="city-selector"
        tagName="twreporter-city-selector"
        {previewStoryId}
        config=""
      />
      <GraphicData {...cardExplorerGraphic} {config} {sources}>
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
                  sources,
                  config,
                  categoryId: category.id,
                  topicId,
                }}
                {#if comparison}
                  <CardComparison {...props} />
                {:else}
                  <CardExplorer {...props} {city} />
                {/if}
                <EmbedCode
                  {componentName}
                  {tagName}
                  {previewStoryId}
                  {sources}
                  {config}
                  extraProps={{
                    'category-id': category.id,
                    'topic-id': topicId,
                    ...(!comparison && { city }),
                  }}
                />
              {/each}
            {/snippet}
            <CardExplorer {sources} {config} {city} full="true" />
            <EmbedCode
              componentName="card-explorer"
              tagName="twreporter-card-explorer"
              {previewStoryId}
              {sources}
              {config}
              extraProps={{ city, full: 'true' }}
            />
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
