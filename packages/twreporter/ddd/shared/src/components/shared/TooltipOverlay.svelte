<script lang="ts">
  import type { ComponentProps, Snippet } from 'svelte'
  import TooltipContent from './TooltipContent.svelte'

  const {
    children,
    variant,
    x,
    y,
  }: {
    children: Snippet
    variant?: ComponentProps<typeof TooltipContent>['variant']
    x: number
    y: number
  } = $props()
  let width = $state(0)
  let height = $state(0)
</script>

<div
  class="tooltip"
  role="tooltip"
  bind:clientWidth={width}
  bind:clientHeight={height}
  style:left={Math.max(8, Math.min(x + 12, window.innerWidth - width - 8)) +
    'px'}
  style:top={Math.max(8, Math.min(y + 12, window.innerHeight - height - 8)) +
    'px'}
>
  <TooltipContent {variant}>{@render children()}</TooltipContent>
</div>

<style>
  .tooltip {
    position: fixed;
    z-index: 100;
    width: max-content;
    max-width: min(320px, calc(100vw - 32px));
    pointer-events: none;
  }
</style>
