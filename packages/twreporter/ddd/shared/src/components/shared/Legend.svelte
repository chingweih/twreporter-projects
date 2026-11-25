<script lang="ts">
  const {
    items,
    active,
    onhover,
  }: {
    items: readonly { label: string; color: string }[]
    active?: string | readonly string[]
    onhover?: (label: string | undefined) => void
  } = $props()
</script>

<ul class="legend" aria-label="圖例">
  {#each items as item (item.label)}
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
      {item.label}
    </li>
  {/each}
</ul>

<style>
  .legend {
    display: flex;
    flex-wrap: wrap;
    justify-content: center;
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
