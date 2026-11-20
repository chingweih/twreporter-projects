<script lang="ts">
  import { onMount, untrack, type ComponentProps, type Snippet } from 'svelte'
  import TooltipOverlay from './TooltipOverlay.svelte'

  const {
    children,
    content,
    variant = 'dark',
    onvisibilitychange,
  }: {
    children: Snippet
    content: Snippet
    variant?: ComponentProps<typeof TooltipOverlay>['variant']
    onvisibilitychange?: (visible: boolean) => void
  } = $props()
  let visible = $state(false)
  let x = $state(0)
  let y = $state(0)
  let touchStart: { x: number; y: number } | undefined
  let touchMoved = false
  let touchInteraction = false

  $effect(() => {
    const currentVisible = visible
    const callback = onvisibilitychange
    untrack(() => callback?.(currentVisible))
  })

  onMount(() => {
    const dismiss = () => {
      visible = false
      if (touchStart) touchMoved = true
    }
    const keyboardInteraction = () => {
      touchInteraction = false
    }
    // Capture also catches scrolling inside a chart's horizontal viewport.
    window.addEventListener('scroll', dismiss, true)
    window.addEventListener('resize', dismiss)
    window.addEventListener('pointerdown', dismiss, true)
    window.addEventListener('keydown', keyboardInteraction, true)
    return () => {
      window.removeEventListener('scroll', dismiss, true)
      window.removeEventListener('resize', dismiss)
      window.removeEventListener('pointerdown', dismiss, true)
      window.removeEventListener('keydown', keyboardInteraction, true)
    }
  })
</script>

<div
  role="group"
  class="anchor"
  onpointerenter={(event) => {
    if (event.pointerType === 'touch') return
    touchInteraction = false
    visible = true
    x = event.clientX
    y = event.clientY
  }}
  onpointermove={(event) => {
    if (event.pointerType === 'touch') {
      if (
        touchStart &&
        Math.hypot(event.clientX - touchStart.x, event.clientY - touchStart.y) >
          8
      ) {
        touchMoved = true
        visible = false
      }
      return
    }
    x = event.clientX
    y = event.clientY
  }}
  onpointerleave={(event) => {
    // Touch pointers leave as soon as the finger lifts, after pointerup.
    if (event.pointerType === 'touch') return
    visible = false
  }}
  onpointerdown={(event) => {
    touchInteraction = event.pointerType === 'touch'
    if (!touchInteraction) return
    touchStart = { x: event.clientX, y: event.clientY }
    touchMoved = false
    visible = false
  }}
  onpointerup={(event) => {
    if (event.pointerType !== 'touch') return
    if (touchStart && !touchMoved) {
      x = event.clientX
      y = event.clientY
      visible = true
    }
    touchStart = undefined
  }}
  onpointercancel={() => {
    touchStart = undefined
    touchMoved = true
    visible = false
  }}
  onfocusin={(event) => {
    if (touchInteraction) return
    const bounds = event.currentTarget.getBoundingClientRect()
    x = bounds.left + bounds.width / 2
    y = bounds.bottom
    visible = true
  }}
  onfocusout={() => {
    visible = false
  }}
>
  {@render children()}
</div>

{#if visible}
  <TooltipOverlay {variant} {x} {y}>
    {@render content()}
  </TooltipOverlay>
{/if}

<style>
  .anchor {
    min-width: 0;
  }
</style>
