<script module lang="ts">
  import { defineMeta } from '@storybook/addon-svelte-csf'
  import type { ComponentProps } from 'svelte'
  import BarChart from './BarChart.svelte'
  import Layout from './Layout.svelte'

  const { Story } = defineMeta({
    title: 'Core/BarChart',
    component: BarChart,
    parameters: { layout: 'padded' },
    render: template,
    args: {
      label: 'Library visits by branch',
      groups: [
        {
          label: 'July',
          bars: [
            { series: 'Central', value: 420 },
            { series: 'East', value: 260 },
          ],
        },
        {
          label: 'August',
          bars: [
            { series: 'Central', value: 480 },
            { series: 'East', value: 310 },
          ],
        },
      ],
      colors: { Central: '#517399', East: '#8ea197' },
      orientation: 'vertical',
      mode: 'grouped',
    },
  })
</script>

{#snippet template(args: ComponentProps<typeof BarChart>)}
  <Layout>
    <div style="max-width: 730px">
      <BarChart {...args} />
    </div>
  </Layout>
{/snippet}

<Story name="Grouped" />
<Story
  name="Stacked horizontal"
  args={{ mode: 'stacked', orientation: 'horizontal' }}
/>
