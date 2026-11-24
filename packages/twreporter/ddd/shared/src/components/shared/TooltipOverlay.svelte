<script lang="ts">
  import type { ComponentProps, Snippet } from 'svelte'
  import TooltipContent from './TooltipContent.svelte'

  const {
    children,
    variant,
    x,
    y,
    bounds,
    id,
  }: {
    children: Snippet
    variant?: ComponentProps<typeof TooltipContent>['variant']
    x: number
    y: number
    bounds?: DOMRectReadOnly
    id?: string
  } = $props()
  let width = $state(0)
  let height = $state(0)
  const position = $derived.by(() => {
    const left = Math.max(0, bounds?.left ?? 0) + 8
    const right = Math.min(window.innerWidth, bounds?.right ?? Infinity) - 8
    const top = Math.max(0, bounds?.top ?? 0) + 8
    const bottom = Math.min(window.innerHeight, bounds?.bottom ?? Infinity) - 8
    return {
      left: Math.max(left, Math.min(x + 12, right - width)),
      top: Math.max(top, Math.min(y + 12, bottom - height)),
      maxWidth: Math.max(0, right - left),
      visible: !bounds || (right > left && bottom > top),
    }
  })
</script>

{#if position.visible}
  <div
    {id}
    class="tooltip"
    role="tooltip"
    bind:clientWidth={width}
    bind:clientHeight={height}
    style:left={`${position.left}px`}
    style:top={`${position.top}px`}
    style:max-width={bounds ? `min(320px, ${position.maxWidth}px)` : undefined}
  >
    <TooltipContent {variant}>{@render children()}</TooltipContent>
  </div>
{/if}

<style>
  .tooltip {
    position: fixed;
    z-index: 100;
    width: max-content;
    max-width: min(320px, calc(100vw - 32px));
    pointer-events: none;
  }
</style>
