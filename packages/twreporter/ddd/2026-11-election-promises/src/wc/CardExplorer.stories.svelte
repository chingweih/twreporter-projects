<script module lang="ts">
  import EmbedCode from '@lab-reporter/ddd-shared/components/shared/EmbedCode.svelte'
  import { defineMeta } from '@storybook/addon-svelte-csf'
  import CardExplorer from './CardExplorer.wc.svelte'
  import defaultConfig from '../../public/card-explorer.json'

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
    {#each defaultConfig.categories as category (category.id)}
      {@const example = {
        ...args,
        categoryId: category.id,
        topicId: category.topics[0]?.id ?? '',
      }}
      <CardExplorer {...example} />
      <EmbedCode
        componentName="card-explorer"
        tagName="twreporter-card-explorer"
        sources={example.sources}
        config={example.config ?? ''}
        extraProps={{
          'category-id': example.categoryId ?? 2,
          'topic-id': example.topicId ?? '',
          city: example.city ?? '',
        }}
      />
    {/each}
  {/snippet}
</Story>
