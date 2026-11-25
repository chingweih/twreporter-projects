<script module lang="ts">
  import { defineMeta } from '@storybook/addon-svelte-csf'
  import type { ComponentProps } from 'svelte'
  import Layout from './Layout.svelte'
  import TooltipOverlay from './TooltipOverlay.svelte'

  const { Story } = defineMeta({
    title: 'UI/TooltipOverlay',
    component: TooltipOverlay,
    parameters: {
      layout: 'fullscreen',
      controls: { include: ['x', 'y', 'title', 'variant'] },
    },
    render: template,
    args: { x: 72, y: 64, title: 'Central branch', variant: 'light' },
  })
</script>

{#snippet template(args: ComponentProps<typeof TooltipOverlay>)}
  <Layout>
    <div style="min-height: 180px">
      <span
        class="anchor"
        style:left={`${args.x}px`}
        style:top={`${args.y}px`}
        aria-hidden="true"
      ></span>
      <TooltipOverlay
        x={args.x}
        y={args.y}
        title={args.title}
        variant={args.variant}
      >
        480 visits in August
      </TooltipOverlay>
    </div>
  </Layout>
{/snippet}

<Story name="Positioned tooltip" />

<style>
  .anchor {
    position: fixed;
    width: 8px;
    height: 8px;
    transform: translate(-50%, -50%);
    border-radius: 50%;
    background: var(--brand-main);
  }
</style>
