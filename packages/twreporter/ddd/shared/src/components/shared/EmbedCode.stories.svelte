<script module lang="ts">
  import { defineMeta } from '@storybook/addon-svelte-csf'
  import type { ComponentProps } from 'svelte'
  import EmbedCode from './EmbedCode.svelte'
  import Layout from './Layout.svelte'

  const { Story } = defineMeta({
    title: 'Editor/EmbedCode',
    component: EmbedCode,
    parameters: { layout: 'padded' },
    render: template,
    args: {
      componentName: 'bar-chart',
      src: './bar-chart/vertical.csv',
      config: './bar-chart/vertical.json',
    },
  })
</script>

{#snippet template(args: ComponentProps<typeof EmbedCode>)}
  <Layout>
    <EmbedCode
      {...args}
      src={args.src && new URL(args.src, document.baseURI).href}
      config={args.config && new URL(args.config, document.baseURI).href}
    />
  </Layout>
{/snippet}

<Story name="Bar chart embed" />
