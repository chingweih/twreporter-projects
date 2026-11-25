<script lang="ts">
  const {
    rows,
  }: { rows: readonly { label: string; value: string; color?: string }[] } =
    $props()
</script>

<div class="tooltip-rows">
  {#each rows as row}
    <div class="legend">
      <span class="swatch" style:background-color={row.color} aria-hidden="true"
      ></span>
      <span>{row.label}</span>
    </div>
    <span class="value">{row.value}</span>
  {/each}
</div>

<style>
  .tooltip-rows {
    display: grid;
    grid-template-columns: minmax(0, 1fr) auto;
    align-items: center;
    gap: 2px 4px;
  }
  .legend {
    display: flex;
    align-items: center;
    min-width: 0;
    gap: 4px;
    padding: 0 8px 0 0;
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
