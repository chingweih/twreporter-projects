<script module lang="ts">
  import { defineMeta } from '@storybook/addon-svelte-csf'
  import type { ComponentProps } from 'svelte'
  import LineChart from './LineChart.svelte'
  import Layout from './Layout.svelte'
  const { Story } = defineMeta({
    title: 'Core/LineChart',
    component: LineChart,
    render: template,
    args: {
      label: '歷年投票率',
      data: [
        { series: '甲市', x: 2014, value: 67 },
        { series: '甲市', x: 2018, value: 72 },
        { series: '甲市', x: 2022, value: 65 },
        { series: '乙市', x: 2014, value: 60 },
        { series: '乙市', x: 2018, value: 68 },
        { series: '乙市', x: 2022, value: 63 },
      ],
      formatValue: (value: number) => `${value}%`,
    },
  })
</script>

{#snippet template(args: ComponentProps<typeof LineChart>)}
  <Layout><div style="max-width: 730px"><LineChart {...args} /></div></Layout>
{/snippet}
<Story name="Line" />
<Story name="Area" args={{ showArea: true }} />

<Story
  name="HorizontalLabelParts"
  args={{
    yLabel: '2022 黃珊珊催票率（%）',
    yLabelHorizontalTexts: ['黃珊珊', '（%）'],
  }}
/>
