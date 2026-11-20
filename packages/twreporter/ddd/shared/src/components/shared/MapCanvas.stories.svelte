<script module lang="ts">
  import { defineMeta } from '@storybook/addon-svelte-csf'
  import type { GeoJSONSourceSpecification } from 'maplibre-gl'
  import type { ComponentProps } from 'svelte'
  import { FillLayer, GeoJSONSource, LineLayer } from 'svelte-maplibre-gl'
  import MapCanvas from './MapCanvas.svelte'

  const area = {
    type: 'Polygon',
    coordinates: [
      [
        [121.45, 25.04],
        [121.51, 24.98],
        [121.6, 25.02],
        [121.57, 25.12],
        [121.48, 25.1],
        [121.45, 25.04],
      ],
    ],
  } satisfies GeoJSONSourceSpecification['data']

  const { Story } = defineMeta({
    title: 'Core/MapCanvas',
    component: MapCanvas,
    parameters: { layout: 'padded', controls: { include: ['height'] } },
    render: template,
    args: {
      bounds: [
        [121.45, 24.98],
        [121.6, 25.12],
      ],
      padding: 24,
      height: '400px',
      interactive: false,
    },
    argTypes: {
      height: { control: 'text' },
    },
  })
</script>

{#snippet template(args: ComponentProps<typeof MapCanvas>)}
  <MapCanvas {...args}>
    <GeoJSONSource id="sample-area" data={area}>
      <FillLayer id="sample-fill" paint={{ 'fill-color': '#a6c9e5' }} />
      <LineLayer
        id="sample-outline"
        paint={{ 'line-color': '#305674', 'line-width': 2 }}
      />
    </GeoJSONSource>
  </MapCanvas>
{/snippet}

<Story name="GeoJSON overlay" />
<Story name="Interactive" args={{ interactive: true }} />
