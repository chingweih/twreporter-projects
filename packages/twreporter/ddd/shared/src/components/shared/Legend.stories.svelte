<script module lang="ts">
  import { defineMeta } from '@storybook/addon-svelte-csf'
  import type { ComponentProps } from 'svelte'
  import { fromStore, writable } from 'svelte/store'
  import Layout from './Layout.svelte'
  import Legend from './Legend.svelte'

  const { Story } = defineMeta({
    title: 'Core/Legend',
    component: Legend,
    parameters: { layout: 'padded', controls: { exclude: ['onhover'] } },
    render: template,
    args: {
      items: [
        { label: 'Central', color: '#517399' },
        { label: 'East', color: '#8ea197' },
        { label: 'West', color: '#b68a68' },
      ],
    },
  })
</script>

{#snippet template(args: ComponentProps<typeof Legend>)}
  {@const hovered = fromStore(writable<string | undefined>())}
  <Layout>
    <Legend
      {...args}
      active={hovered.current ?? args.active}
      onhover={(label) => (hovered.current = label)}
    />
  </Layout>
{/snippet}

<Story name="Hover highlight" />
<Story name="Active item" args={{ active: 'Central' }} />
