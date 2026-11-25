<script module lang="ts">
  import { defineMeta } from '@storybook/addon-svelte-csf'
  import type { ComponentProps } from 'svelte'
  import Layout from './Layout.svelte'
  import Tooltip from './Tooltip.svelte'

  const { Story } = defineMeta({
    title: 'UI/Tooltip',
    component: Tooltip,
    parameters: {
      layout: 'padded',
      controls: { include: ['title', 'variant'] },
    },
    render: template,
    args: { title: 'Central branch', variant: 'light' },
  })
</script>

{#snippet template({ title, variant }: ComponentProps<typeof Tooltip>)}
  <Layout>
    <div style="width: max-content; padding: 16px">
      <Tooltip {title} {variant}>
        <button
          type="button"
          style="padding: 6px 12px; border: 1px solid var(--neutral-gray-300)"
          >Central branch</button
        >
        {#snippet content()}480 visits in August{/snippet}
      </Tooltip>
    </div>
  </Layout>
{/snippet}

<Story name="Light" />
<Story name="Dark" args={{ variant: 'dark' }} />
