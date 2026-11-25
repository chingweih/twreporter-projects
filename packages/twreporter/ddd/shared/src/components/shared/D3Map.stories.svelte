<script module lang="ts">
  import { defineMeta } from '@storybook/addon-svelte-csf'
  import type { GeoPermissibleObjects } from 'd3-geo'
  import type { ComponentProps } from 'svelte'
  import { MapDrilldown } from '../../utils/map-drilldown.svelte.ts'
  import D3DrilldownMap, { type DrilldownArea } from './D3DrilldownMap.svelte'
  import D3Map from './D3Map.svelte'

  const west = {
    type: 'Polygon',
    coordinates: [
      [
        [0, 0],
        [0, 2],
        [2, 2],
        [2, 0],
        [0, 0],
      ],
    ],
  } satisfies GeoPermissibleObjects
  const east = {
    type: 'Polygon',
    coordinates: [
      [
        [2, 0],
        [2, 2],
        [4, 3],
        [4, 0],
        [2, 0],
      ],
    ],
  } satisfies GeoPermissibleObjects
  const geometry = {
    type: 'GeometryCollection',
    geometries: [west, east],
  } satisfies GeoPermissibleObjects
  const regions = [
    { key: 'west', geometry: west, label: 'West region', fill: '#cadeeb' },
    { key: 'east', geometry: east, label: 'East region', fill: '#92b5cb' },
  ] satisfies DrilldownArea[]

  const details = [
    {
      key: 'west-center',
      geometry: {
        type: 'Polygon',
        coordinates: [
          [
            [0.25, 0.25],
            [0.25, 1.75],
            [1.75, 1.75],
            [1.75, 0.25],
            [0.25, 0.25],
          ],
        ],
      },
      label: 'West center',
      fill: '#cadeeb',
    },
    {
      key: 'east-center',
      geometry: {
        type: 'Polygon',
        coordinates: [
          [
            [2.25, 0.25],
            [2.25, 1.75],
            [3.75, 2.5],
            [3.75, 0.25],
            [2.25, 0.25],
          ],
        ],
      },
      label: 'East center',
      fill: '#92b5cb',
    },
  ] satisfies DrilldownArea[]

  const { Story } = defineMeta({
    title: 'Core/D3Map',
    component: D3Map,
    parameters: { layout: 'padded', controls: { include: ['padding'] } },
    render: template,
    args: {
      geometry,
      width: 480,
      height: 300,
      padding: 24,
      label: 'Region map',
    },
  })
</script>

{#snippet template(args: ComponentProps<typeof D3Map>)}
  <D3Map {...args}>
    {#snippet children(path)}
      <path
        data-map-tooltip="West region"
        d={path(west)}
        fill="#cadeeb"
        stroke="#fff"
        vector-effect="non-scaling-stroke"
      />
      <path
        data-map-tooltip="East region"
        d={path(east)}
        fill="#92b5cb"
        stroke="#fff"
        vector-effect="non-scaling-stroke"
      />
    {/snippet}
    {#snippet tooltip(region)}{region}{/snippet}
  </D3Map>
{/snippet}

<Story name="Overview" />
<Story name="Focused region" args={{ focus: east }} />
<Story name="Drill-down">
  {#snippet template({ width, height, padding })}
    {@const drilldown = new MapDrilldown(
      (key) => regions.find((region) => region.key === key)?.geometry,
    )}
    {#if drilldown.focus}
      <button
        type="button"
        bind:this={drilldown.backButton}
        onclick={() => drilldown.reset()}
      >
        Back to all regions
      </button>
    {/if}
    <D3DrilldownMap
      {geometry}
      {width}
      {height}
      {padding}
      {regions}
      {drilldown}
      details={details.filter((detail) =>
        detail.key.startsWith(`${drilldown.selectedKey}-`),
      )}
      label="Region map"
    >
      {#snippet tooltip(key)}
        {[...regions, ...details].find((area) => area.key === key)?.label}
      {/snippet}
    </D3DrilldownMap>
  {/snippet}
</Story>
