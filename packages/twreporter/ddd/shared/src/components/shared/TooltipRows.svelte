<script lang="ts">
  const {
    rows,
  }: { rows: readonly { label: string; value?: string; color?: string }[] } =
    $props()
  const hasValues = $derived(rows.some((row) => row.value !== undefined))
</script>

<div class="tooltip-rows" class:with-values={hasValues}>
  {#each rows as row}
    <div class="legend">
      <span class="swatch" style:background-color={row.color} aria-hidden="true"
      ></span>
      <span>{row.label}</span>
    </div>
    {#if row.value !== undefined}
      <span class="value">{row.value}</span>
    {:else if hasValues}
      <span aria-hidden="true"></span>
    {/if}
  {/each}
</div>

<style>
  .tooltip-rows {
    display: grid;
    grid-template-columns: minmax(0, 1fr);
    align-items: center;
    gap: 2px 4px;
  }
  .with-values {
    grid-template-columns: minmax(0, 1fr) auto;
  }
  .legend {
    display: flex;
    align-items: center;
    min-width: 0;
    gap: 4px;
  }
  .with-values .legend {
    padding-inline-end: 8px;
  }
  .swatch {
    flex-shrink: 0;
    width: 1em;
    height: 1em;
    border-radius: 2px;
  }
  .value {
    margin-left: 4px;
    padding-left: 6px;
    border-left: 1px solid var(--neutral-gray-200, #ddd);
    text-align: right;
    font-variant-numeric: tabular-nums;
  }
</style>
