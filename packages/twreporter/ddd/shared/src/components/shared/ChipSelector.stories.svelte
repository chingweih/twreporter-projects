<script module lang="ts">
  import { defineMeta } from '@storybook/addon-svelte-csf'
  import type { ComponentProps } from 'svelte'
  import { fromStore, writable } from 'svelte/store'
  import ChipSelector from './ChipSelector.svelte'
  import Layout from './Layout.svelte'

  const { Story } = defineMeta({
    title: 'UI/ChipSelector',
    component: ChipSelector,
    parameters: {
      layout: 'padded',
      controls: { exclude: ['onchange', 'optionLabel'] },
    },
    render: template,
    args: {
      label: 'Library branch',
      value: 'central',
      options: [
        { value: 'central', label: 'Central', color: '#c9d1c7', count: 18 },
        { value: 'east', label: 'East', color: '#bed4ea', count: 12 },
        { value: 'west', label: 'West', color: '#dfc6ab', count: 9 },
      ],
    },
  })
</script>

{#snippet template(args: ComponentProps<typeof ChipSelector>)}
  {@const selection = fromStore(writable(args.value))}
  <Layout>
    <ChipSelector
      {...args}
      value={selection.current}
      onchange={(value) => (selection.current = value)}
    />
  </Layout>
{/snippet}

<Story name="Legend" />
<Story name="Selector" args={{ variant: 'selector', countUnit: 'events' }} />
