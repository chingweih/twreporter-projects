<script module lang="ts">
  import EmbedCode from '@lab-reporter/ddd-shared/components/shared/EmbedCode.svelte'
  import { defineMeta } from '@storybook/addon-svelte-csf'
  import CardExplorer from './CardExplorer.wc.svelte'

  const { Story } = defineMeta({
    title: 'Components/CardExplorer',
    component: CardExplorer,
    args: {
      src: './card-explorer.csv',
      config: './card-explorer.json',
    },
    argTypes: {
      src: { control: 'text' },
      config: { control: 'text' },
    },
  })
</script>

<Story name="Default">
  {#snippet template(args)}
    <CardExplorer {...args} />
    <EmbedCode
      componentName="card-explorer"
      tagName="twreporter-2026-11-election-promises-card-explorer"
      {...args}
    />
  {/snippet}
</Story>
