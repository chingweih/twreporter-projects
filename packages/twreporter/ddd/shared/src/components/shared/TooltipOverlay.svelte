<script module lang="ts">
  export type TooltipPosition = { x: number; y: number } | { anchor: Element }
</script>

<script lang="ts">
  import type { ComponentProps, Snippet } from 'svelte'
  import TooltipContent from './TooltipContent.svelte'

  const {
    children,
    variant,
    x = 0,
    y = 0,
    anchor,
    boundary,
    bounds,
    id,
    title,
  }: {
    children: Snippet
    variant?: ComponentProps<typeof TooltipContent>['variant']
    x?: number
    y?: number
    anchor?: Element
    boundary?: Element
    bounds?: DOMRectReadOnly
    id?: string
    title?: string
  } = $props()
  let width = $state(0)
  let height = $state(0)
  let measured = $state.raw<{
    target: DOMRect
    chart: DOMRect
    clip: Pick<DOMRectReadOnly, 'left' | 'right' | 'top' | 'bottom'>
  }>()

  $effect(() => {
    if (!anchor || !boundary) return
    const target = anchor
    const chart = boundary
    const root = target.getRootNode()
    const clippingParents: { element: HTMLElement; x: boolean; y: boolean }[] =
      []
    for (
      let parent = chart.parentElement;
      parent;
      parent = parent.parentElement
    ) {
      const { overflowX, overflowY } = getComputedStyle(parent)
      if (overflowX !== 'visible' || overflowY !== 'visible') {
        clippingParents.push({
          element: parent,
          x: overflowX !== 'visible',
          y: overflowY !== 'visible',
        })
      }
    }
    const controller = new AbortController()
    const { signal } = controller
    const measure = () => {
      const chartRect = chart.getBoundingClientRect()
      let left = Math.max(0, chartRect.left)
      let right = Math.min(window.innerWidth, chartRect.right)
      let top = Math.max(0, chartRect.top)
      let bottom = Math.min(window.innerHeight, chartRect.bottom)
      // A fixed-position tooltip can paint outside a chart's scroll container.
      for (const parent of clippingParents) {
        const rect = parent.element.getBoundingClientRect()
        if (parent.x) {
          left = Math.max(left, rect.left)
          right = Math.min(right, rect.right)
        }
        if (parent.y) {
          top = Math.max(top, rect.top)
          bottom = Math.min(bottom, rect.bottom)
        }
      }
      measured = {
        target: target.getBoundingClientRect(),
        chart: chartRect,
        clip: { left, right, top, bottom },
      }
    }
    measure()
    window.addEventListener('scroll', measure, { capture: true, signal })
    window.addEventListener('resize', measure, { signal })
    if (root instanceof ShadowRoot) {
      root.addEventListener('scroll', measure, { capture: true, signal })
    }
    const observer = new ResizeObserver(measure)
    observer.observe(target)
    observer.observe(chart)
    for (const parent of clippingParents) observer.observe(parent.element)
    return () => {
      controller.abort()
      observer.disconnect()
    }
  })

  function showAboveScaledGraphic(element: HTMLDivElement) {
    if (!element.closest('.fixed-ratio')) return
    // A transformed ancestor would otherwise trap the viewport coordinates.
    element.popover = 'manual'
    element.showPopover()
  }

  const position = $derived.by(() => {
    if (anchor && boundary) {
      if (!measured) return
      const { target, chart, clip } = measured
      if (clip.right <= clip.left || clip.bottom <= clip.top) return
      const left = Math.max(
        chart.left + 8,
        Math.min(
          target.left + (target.width - width) / 2,
          chart.right - width - 8,
        ),
      )
      const below = target.bottom + 12
      const top =
        below + height > chart.bottom &&
        target.top - chart.top > chart.bottom - below
          ? target.top - height - 12
          : below
      const insets = [
        clip.top - top,
        left + width - clip.right,
        top + height - clip.bottom,
        clip.left - left,
      ]
      return {
        left,
        top,
        maxWidth: Math.max(0, chart.width - 16),
        clip: `inset(${insets.map((inset) => `${inset}px`).join(' ')})`,
      }
    }
    const left = Math.max(0, bounds?.left ?? 0) + 8
    const right = Math.min(window.innerWidth, bounds?.right ?? Infinity) - 8
    const top = Math.max(0, bounds?.top ?? 0) + 8
    const bottom = Math.min(window.innerHeight, bounds?.bottom ?? Infinity) - 8
    if (bounds && (right <= left || bottom <= top)) return
    return {
      left: Math.max(left, Math.min(x + 12, right - width)),
      top: Math.max(top, Math.min(y + 12, bottom - height)),
      maxWidth: bounds ? right - left : undefined,
    }
  })
</script>

{#if position}
  <div
    {id}
    class="tooltip"
    role="tooltip"
    {@attach showAboveScaledGraphic}
    bind:clientWidth={width}
    bind:clientHeight={height}
    style:left={`${position.left}px`}
    style:top={`${position.top}px`}
    style:max-width={position.maxWidth === undefined
      ? undefined
      : `min(320px, ${position.maxWidth}px)`}
    style:clip-path={position.clip}
  >
    <TooltipContent {variant} {title}>{@render children()}</TooltipContent>
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

  .tooltip:global([popover]) {
    inset: auto;
    margin: 0;
    padding: 0;
    border: 0;
    overflow: visible;
    background: transparent;
  }
</style>
