<script lang="ts">
  import type { StyleSpecification } from 'maplibre-gl'
  import mapLibreCss from 'maplibre-gl/dist/maplibre-gl.css?inline'
  import type { ComponentProps } from 'svelte'
  import { MapLibre, NavigationControl } from 'svelte-maplibre-gl'

  const emptyStyle: StyleSpecification = { version: 8, sources: {}, layers: [] }

  const {
    height = '400px',
    padding = 8,
    interactive = false,
    children: overlays,
    bounds,
    style = emptyStyle,
    ...options
  }: Pick<
    ComponentProps<typeof MapLibre>,
    | 'bounds'
    | 'center'
    | 'zoom'
    | 'minZoom'
    | 'maxZoom'
    | 'style'
    | 'interactive'
    | 'children'
    | 'canvasContextAttributes'
  > & { height?: string; padding?: number } = $props()
</script>

<!-- MapLibre's stylesheet must be inside the custom element's shadow root. -->
{@html `<style>${mapLibreCss}</style>`}

<MapLibre
  {...options}
  {bounds}
  {style}
  {interactive}
  inlineStyle="width: 100%; height: {height}"
  autoloadGlobalCss={false}
  pixelRatio={Math.min(globalThis.devicePixelRatio || 1, 2)}
  renderWorldCopies={false}
  cooperativeGestures={interactive}
  dragRotate={false}
  touchPitch={false}
  attributionControl={style !== emptyStyle && { compact: true }}
  fitBoundsOptions={{ padding }}
  onresize={({ target }) => {
    if (bounds && !interactive) {
      target.fitBounds(bounds, { padding, animate: false })
    }
  }}
>
  {#snippet children(map)}
    {#if interactive}
      <NavigationControl showCompass={false} />
    {/if}
    {@render overlays?.(map)}
  {/snippet}
</MapLibre>
