<script module lang="ts">
  import { defineMeta } from '@storybook/addon-svelte-csf'
  import type { GeoPermissibleObjects } from 'd3-geo'
  import type { ComponentProps } from 'svelte'
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
