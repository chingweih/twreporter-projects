<script lang="ts">
  import type { Snippet } from 'svelte'

  const { children, content }: { children: Snippet; content: Snippet } =
    $props()
  let visible = $state(false)
  let x = $state(0)
  let y = $state(0)
  let width = $state(0)
  let height = $state(0)
</script>

<div
  role="group"
  class="anchor"
  onpointerenter={(event) => {
    visible = true
    x = event.clientX
    y = event.clientY
  }}
  onpointermove={(event) => {
    x = event.clientX
    y = event.clientY
  }}
  onpointerleave={() => {
    visible = false
  }}
  onfocusin={(event) => {
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
    {@render content()}
  </div>
{/if}

<style>
  .anchor {
    min-width: 0;
  }
  .tooltip {
    position: fixed;
    z-index: 100;
    width: max-content;
    max-width: min(320px, calc(100vw - 32px));
    padding: 10px 12px;
    border-radius: 6px;
    background: var(--neutral-gray-900);
    color: var(--neutral-white);
    font-size: 13px;
    line-height: 1.6;
    box-shadow: 0 4px 14px
      color-mix(in srgb, var(--neutral-black) 20%, transparent);
    pointer-events: none;
  }
  .tooltip :global(*) {
    color: inherit;
  }
</style>
