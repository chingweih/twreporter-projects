<script lang="ts">
  import type { Snippet } from 'svelte'
  const {
    items,
    align,
    active,
    onhover,
    children,
  }: {
    items: readonly (
      | { label: string | null; color: string }
      | null
      | undefined
    )[]
    align?: 'left' | 'center' | 'right'
    active?: string | readonly string[]
    onhover?: (label: string | undefined) => void
    children?: Snippet<[string]>
  } = $props()
  const visibleItems = $derived(
    items.filter(
      (item): item is { label: string; color: string } =>
        item != null && item.label != null && item.label.trim().length > 0,
    ),
  )
</script>

<ul
  class="legend"
  aria-label="圖例"
  style:justify-content={align === undefined
    ? undefined
    : align === 'left'
      ? 'flex-start'
      : align === 'right'
        ? 'flex-end'
        : 'center'}
>
  {#each visibleItems as item (item.label)}
    <li
      style:opacity={active !== undefined &&
      (typeof active === 'string'
        ? active !== item.label
        : !active.includes(item.label))
        ? 0.25
        : 1}
      onpointerenter={(event) => {
        if (event.pointerType !== 'touch') onhover?.(item.label)
      }}
      onpointerleave={() => onhover?.(undefined)}
      onpointercancel={() => onhover?.(undefined)}
    >
      <span style:background-color={item.color}></span>
      {#if children}
        {@render children(item.label)}
      {:else}
        {item.label}
      {/if}
    </li>
  {/each}
</ul>

<style>
  .legend {
    display: flex;
    flex-wrap: wrap;
    justify-content: var(--legend-align, center);
    gap: 6px 20px;
    padding: 0;
    list-style: none;
  }
  li {
    display: flex;
    align-items: center;
    gap: 4px;
    transition: opacity 150ms ease;
  }
  span {
    width: 1em;
    height: 1em;
    border-radius: 2px;
  }
  @media (prefers-reduced-motion: reduce) {
    li {
      transition: none;
    }
  }
</style>
