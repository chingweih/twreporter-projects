<script module lang="ts">
  import type { GeoPermissibleObjects } from 'd3-geo'

  export type DrilldownArea = {
    key: string
    geometry: GeoPermissibleObjects
    label: string
    fill: string
  }
</script>

<script lang="ts">
  import type { ComponentProps } from 'svelte'
  import type { MapDrilldown } from '../../utils/map-drilldown.svelte.ts'
  import D3Map from './D3Map.svelte'

  const {
    drilldown,
    parentKey,
    regions,
    details,
    ...map
  }: Pick<
    ComponentProps<typeof D3Map>,
    | 'geometry'
    | 'width'
    | 'height'
    | 'padding'
    | 'label'
    | 'style'
    | 'tooltip'
    | 'containTooltip'
  > & {
    drilldown: MapDrilldown<GeoPermissibleObjects>
    parentKey?: string
    regions: readonly DrilldownArea[]
    details: readonly DrilldownArea[]
  } = $props()

  const tooltipId = $props.id()
  const focus = $derived(drilldown.focus)
  const context = $derived(
    focus !== undefined && parentKey !== drilldown.selectedKey,
  )
  const selected = $derived(
    regions.find((region) => region.key === drilldown.selectedKey),
  )

  function showDetailTooltip(key: string, path: SVGPathElement) {
    if (!path.ownerSVGElement) return
    drilldown.tooltipTarget = { key, focus, source: path.ownerSVGElement }
  }
</script>

<D3Map
  {...map}
  {focus}
  {tooltipId}
  bind:tooltipTarget={drilldown.tooltipTarget}
  onbackgroundclick={focus ? () => drilldown.back() : undefined}
>
  {#snippet children(path)}
    {#each regions as region (region.key)}
      {@const isSelected = region === selected}
      <path
        class:context
        class:selected={isSelected}
        d={path(region.geometry)}
        fill={region.fill}
        data-map-region={region.key}
        data-map-tooltip={context ? undefined : region.key}
        role="button"
        tabindex={isSelected ? -1 : 0}
        aria-hidden={isSelected || undefined}
        aria-label={region.label}
        aria-describedby={!context &&
        drilldown.tooltipTarget?.key === region.key
          ? tooltipId
          : undefined}
        onclick={(event) =>
          drilldown.select(region.key, event.currentTarget, parentKey)}
        onkeydown={(event) => {
          if (event.key !== 'Enter' && event.key !== ' ') return
          event.preventDefault()
          drilldown.select(region.key, event.currentTarget, parentKey)
        }}
      />
    {/each}
    {#each details as detail (detail.key)}
      <path
        d={path(detail.geometry)}
        fill={detail.fill}
        data-map-tooltip={detail.key}
        role="button"
        tabindex="0"
        aria-label={detail.label}
        aria-describedby={drilldown.tooltipTarget?.key === detail.key
          ? tooltipId
          : undefined}
        onclick={(event) => showDetailTooltip(detail.key, event.currentTarget)}
        onkeydown={(event) => {
          if (event.key !== 'Enter' && event.key !== ' ') return
          event.preventDefault()
          showDetailTooltip(detail.key, event.currentTarget)
        }}
      />
    {/each}
    {#if selected}
      <path class="outline" d={path(selected.geometry)} />
    {/if}
  {/snippet}
</D3Map>

<style>
  path {
    stroke: var(--neutral-white, white);
    stroke-width: 1;
    vector-effect: non-scaling-stroke;
  }

  path[role='button'] {
    cursor: pointer;
  }

  path[role='button']:focus {
    outline: none;
  }

  path[role='button']:hover,
  path[role='button']:focus-visible {
    filter: brightness(0.86);
  }

  .context {
    fill: var(--drilldown-context-fill, #ddd);
  }

  .selected,
  .outline {
    pointer-events: none;
  }

  .outline {
    fill: none;
    stroke: var(--drilldown-outline-color, #999);
  }
</style>
