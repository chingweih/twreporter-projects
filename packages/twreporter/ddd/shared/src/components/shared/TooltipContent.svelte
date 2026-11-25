<script lang="ts">
  import type { Snippet } from 'svelte'

  const {
    children,
    variant = 'light',
    title,
  }: {
    children: Snippet
    variant?: 'dark' | 'light'
    title?: string
  } = $props()
</script>

<div class="content" class:light={variant === 'light'}>
  {#if title}<div class="header"><strong>{title}</strong></div>{/if}
  <div class="body">{@render children()}</div>
</div>

<style>
  .content {
    box-sizing: border-box;
    max-height: inherit;
    overflow: auto;
    padding: 0;
    border-radius: 6px;
    background: var(--neutral-gray-900, #1a1a1a);
    color: var(--neutral-white, #fff);
    font-size: 13px;
    line-height: 1.6;
    box-shadow: 0 4px 14px
      color-mix(in srgb, var(--neutral-black, #000) 20%, transparent);
  }
  .content :global(*) {
    color: inherit;
    font-family: 'Roboto Slab', 'Noto Sans TC', sans-serif;
  }
  .light {
    border: 1px solid var(--neutral-gray-200, #ddd);
    padding: 0;
    background: #ffffffee;
    color: var(--neutral-gray-800, #333);
    box-shadow: 0 4px 14px rgba(0, 0, 0, 0.2);
    backdrop-filter: blur(8px);
  }
  .header {
    padding: 10px 12px 7px;
    border-bottom: 1px solid var(--neutral-gray-200, #ddd);
    font-size: 16px;
    line-height: 1.3;
  }
  .body {
    padding: 10px 12px;
  }
  .header + .body {
    padding-top: 7px;
  }
  /* Existing project popups already provide their own header and body spacing. */
  .body:has(> :global(.popup)) {
    padding: 0;
  }
</style>
