<script module lang="ts">
  import { defineMeta } from '@storybook/addon-svelte-csf'
  import EmbedCode from '@lab-reporter/ddd-shared/components/shared/EmbedCode.svelte'
  import CardComparison from './CardComparison.wc.svelte'

  const { Story } = defineMeta({
    title: 'Components/CardComparison',
    component: CardComparison,
    args: {
      sources: {
        answers: './card-explorer-answers.csv',
        reviews: './card-explorer-reviews.csv',
      },
      config: './card-explorer.json',
      categoryId: 2,
    },
  })
</script>

<Story name="Default">
  {#snippet template(args)}
    {@const categoryId = args.categoryId ?? 2}
    <CardComparison {...args} {categoryId} />
    <EmbedCode
      componentName="card-comparison"
      tagName="twreporter-card-comparison"
      sources={args.sources}
      config={args.config ?? ''}
      extraProps={{
        'category-id': categoryId,
        'topic-id': args.topicId ?? '',
      }}
    />
  {/snippet}
</Story>
