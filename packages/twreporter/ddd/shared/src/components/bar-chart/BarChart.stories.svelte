<script module lang="ts">
  import { defineMeta } from '@storybook/addon-svelte-csf'
  import type { ComponentProps } from 'svelte'
  import EmbedCode from '../shared/EmbedCode.svelte'
  import BarChartElement from './BarChart.wc.svelte'

  const { Story } = defineMeta({
    title: 'Components/BarChart',
    component: BarChartElement,
    render: template,
    args: {
      src: './bar-chart/vertical.csv',
      config: './bar-chart/vertical.json',
    },
    argTypes: {
      src: { control: 'text' },
      config: { control: 'text' },
      ratio: { control: 'number' },
    },
  })
</script>

{#snippet template(args: ComponentProps<typeof BarChartElement>)}
  <BarChartElement {...args} />
  <EmbedCode
    componentName="bar-chart"
    tagName="twreporter-bar-chart"
    src={args.src && new URL(args.src, document.baseURI).href}
    config={args.config && new URL(args.config, document.baseURI).href}
    ratio={args.ratio}
  />
{/snippet}

<Story exportName="Default" name="Vertical" />
<Story
  name="Stacked Horizontal"
  args={{
    src: './bar-chart/stacked.csv',
    config: './bar-chart/stacked-horizontal.json',
  }}
/>
<Story
  name="Stacked Vertical"
  args={{
    src: './bar-chart/stacked.csv',
    config: './bar-chart/stacked-vertical.json',
  }}
/>
<Story
  name="Horizontal"
  args={{
    src: './bar-chart/horizontal.csv',
    config: './bar-chart/horizontal.json',
  }}
/>
