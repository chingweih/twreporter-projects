<script module lang="ts">
  import EmbedCode from '@lab-reporter/ddd-shared/components/shared/EmbedCode.svelte'
  import { defineMeta } from '@storybook/addon-svelte-csf'
  import MayorMap from './MayorMap.wc.svelte'

  const { Story } = defineMeta({
    title: 'Components/MayorMap',
    component: MayorMap,
    args: {
      src: './mayor-map.csv',
      config: './mayor-map.json',
    },
    argTypes: {
      src: { control: 'text' },
      config: { control: 'text' },
    },
  })
</script>

<Story name="Default">
  {#snippet template(args)}
    <MayorMap {...args} />
    <EmbedCode
      componentName="mayor-map"
      tagName="twreporter-2026-11-election-vote-mayor-map"
      {...args}
    />
  {/snippet}
</Story>
