<script lang="ts">
  import type { Snippet } from 'svelte'

  const { children, label }: { children: Snippet; label?: string } = $props()
  let viewport: HTMLDivElement | undefined = $state()
  let canScroll = $state(false)
  let canScrollRight = $state(false)

  function updateFade() {
    if (!viewport) return
    const overflow = viewport.scrollWidth - viewport.clientWidth
    canScroll = overflow > 1
    canScrollRight = overflow - viewport.scrollLeft > 1
  }

  $effect(() => {
    if (!viewport) return
    const observer = new ResizeObserver(updateFade)
    observer.observe(viewport)
    for (const child of viewport.children) observer.observe(child)
    return () => observer.disconnect()
  })
</script>

<div class="scroll-container">
  <!-- svelte-ignore a11y_no_noninteractive_tabindex (Keyboard users need to focus an overflowing scroll region.) -->
  <div
    class="viewport"
    bind:this={viewport}
    role={label ? 'region' : undefined}
    aria-label={label}
    tabindex={label && canScroll ? 0 : undefined}
    onscroll={updateFade}
  >
    {@render children()}
  </div>
  <div class="fade" class:visible={canScrollRight} aria-hidden="true"></div>
</div>

<style>
  .scroll-container {
    position: relative;
    min-width: 0;
    width: 100%;
  }

  .viewport {
    overflow-x: auto;
    scrollbar-width: none;
  }

  .viewport::-webkit-scrollbar {
    display: none;
  }

  .fade {
    position: absolute;
    top: 0;
    right: -1px;
    bottom: 0;
    width: 40px;
    background: linear-gradient(to left, var(--neutral-gray-50), transparent);
    pointer-events: none;
    opacity: 0;
    transition: opacity 0.15s;
  }

  .fade.visible {
    opacity: 1;
  }
</style>
