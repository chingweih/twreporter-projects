<script module lang="ts">
  import { defineMeta } from '@storybook/addon-svelte-csf'
  import type { ComponentProps } from 'svelte'
  import Layout from './Layout.svelte'
  import TooltipContent from './TooltipContent.svelte'

  const { Story } = defineMeta({
    title: 'UI/TooltipContent',
    component: TooltipContent,
    parameters: {
      layout: 'padded',
      controls: { include: ['title', 'variant'] },
    },
    render: template,
    args: { title: 'Central branch', variant: 'light' },
  })
</script>

{#snippet template({ title, variant }: ComponentProps<typeof TooltipContent>)}
  <Layout>
    <div style="width: max-content">
      <TooltipContent {title} {variant}>480 visits in August</TooltipContent>
    </div>
  </Layout>
{/snippet}

<Story name="Light" />
<Story name="Dark" args={{ variant: 'dark' }} />
