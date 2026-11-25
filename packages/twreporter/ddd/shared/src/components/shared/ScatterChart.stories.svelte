<script module lang="ts">
  import { defineMeta } from '@storybook/addon-svelte-csf'
  import type { ComponentProps } from 'svelte'
  import ScatterChart from './ScatterChart.svelte'
  import Layout from './Layout.svelte'
  const { Story } = defineMeta({
    title: 'Core/ScatterChart',
    component: ScatterChart,
    render: template,
    args: {
      label: '村里得票率比較',
      xLabel: '上次得票率（%）',
      yLabel: '本次得票率（%）',
      formatX: (v: number) => `${v}%`,
      formatY: (v: number) => `${v}%`,
      data: [
        { series: '甲候選人', label: '甲里', x: 20, y: 35 },
        { series: '甲候選人', label: '乙里', x: 30, y: 45 },
        { series: '乙候選人', label: '甲里', x: 20, y: 55 },
        { series: '乙候選人', label: '乙里', x: 30, y: 40 },
      ],
    },
  })
</script>

{#snippet template(args: ComponentProps<typeof ScatterChart>)}
  <Layout><div style="max-width:730px"><ScatterChart {...args} /></div></Layout>
{/snippet}
<Story name="Default" />
<Story
  name="SinglePoint"
  args={{ data: [{ series: '甲候選人', x: 0, y: 0 }] }}
/>
<Story name="Empty" args={{ data: [] }} />
