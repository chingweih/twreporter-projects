<script module lang="ts">
  import type { GeoPermissibleObjects } from 'd3-geo'

  export type MapTooltipTarget = {
    key: string
    pointer?: { x: number; y: number; coordinates?: [number, number] }
    source: SVGSVGElement
    focus: GeoPermissibleObjects | undefined
  }
</script>

<script lang="ts">
  import { geoIdentity, geoPath, type GeoPath } from 'd3-geo'
  import type { Snippet } from 'svelte'
  import { on } from 'svelte/events'
  import TooltipOverlay from './TooltipOverlay.svelte'

  let {
    geometry,
    width,
    height,
    padding = 0,
    preserveAspectRatio = 'xMidYMid meet',
    focus,
    label,
    style,
    children,
    tooltip,
    tooltipTitle,
    tooltipId,
    tooltipTarget = $bindable(),
    containTooltip = false,
    onbackgroundclick,
  }: {
    geometry: GeoPermissibleObjects
    width: number
    height: number
    padding?: number
    preserveAspectRatio?: string
    focus?: GeoPermissibleObjects
    label?: string
    style?: string
    children: Snippet<[GeoPath]>
    tooltip?: Snippet<[string]>
    tooltipTitle?: (key: string) => string
    tooltipId?: string
    tooltipTarget?: MapTooltipTarget
    containTooltip?: boolean
    onbackgroundclick?: () => void
  } = $props()

  let svg = $state<SVGSVGElement>()
  let mapLayer = $state<SVGGElement>()
  let zooming = $state(false)
  let viewportRevision = $state(0)
  const tooltipKey = $derived(
    tooltipTarget?.focus === focus ? tooltipTarget?.key : undefined,
  )
  const isTooltipSource = $derived(tooltipTarget?.source === svg)
  const areaElement = $derived(
    svg && tooltipKey
      ? svg.querySelector(`[data-map-tooltip="${CSS.escape(tooltipKey)}"]`)
      : undefined,
  )
  const areaAnchor = $derived.by(() => {
    if (!tooltipKey || !svg || zooming) return
    // Keyboard and touch anchors follow the rendered path after zoom or scroll.
    void viewportRevision
    const { left, width, top, bottom } = (
      areaElement ?? svg
    ).getBoundingClientRect()
    return { x: left + width / 2, y: areaElement ? bottom : top }
  })
  const tooltipAnchor = $derived.by(() => {
    if (!tooltipKey || zooming) return
    const pointer = tooltipTarget?.pointer
    if (isTooltipSource && pointer) return pointer
    if (pointer?.coordinates) {
      const point = projection(pointer.coordinates)
      const matrix = mapLayer?.getScreenCTM()
      if (point && matrix) return new DOMPoint(...point).matrixTransform(matrix)
    }
    return areaAnchor
  })
  const tooltipBounds = $derived.by(() => {
    if (!containTooltip || !tooltipKey || zooming) return
    void viewportRevision
    return svg?.getBoundingClientRect()
  })

  function dismissTooltip() {
    if (isTooltipSource) tooltipTarget = undefined
  }

  function trackPointer(event: PointerEvent) {
    if (!svg || zooming || event.pointerType === 'touch') return
    const key =
      event.target instanceof SVGElement
        ? event.target
            .closest('[data-map-tooltip]')
            ?.getAttribute('data-map-tooltip')
        : undefined
    if (key) {
      const pointer = { x: event.clientX, y: event.clientY }
      const matrix = mapLayer?.getScreenCTM()
      const point = matrix
        ? new DOMPoint(pointer.x, pointer.y).matrixTransform(matrix.inverse())
        : undefined
      const coordinates =
        point && Number.isFinite(point.x) && Number.isFinite(point.y)
          ? (projection.invert([point.x, point.y]) ?? undefined)
          : undefined
      tooltipTarget = {
        key,
        pointer: { ...pointer, coordinates },
        focus,
        source: svg,
      }
    } else {
      dismissTooltip()
    }
  }

  function showFocusedTooltip(event: FocusEvent) {
    const target = event.target
    if (
      !svg ||
      !(target instanceof SVGElement) ||
      !target.matches(':focus-visible')
    )
      return
    const key = target.getAttribute('data-map-tooltip')
    if (!key) return
    tooltipTarget = { key, focus, source: svg }
  }

  function updateZoom(event: TransitionEvent) {
    if (
      event.target !== event.currentTarget ||
      event.propertyName !== 'transform'
    )
      return
    zooming = event.type === 'transitionrun'
  }

  function updateViewport() {
    if (tooltipTarget?.pointer) dismissTooltip()
    else if (tooltipKey) viewportRevision += 1
  }

  $effect(() => {
    if (!tooltip) return
    const stopScroll = on(window, 'scroll', updateViewport, { capture: true })
    const stopResize = on(window, 'resize', updateViewport)
    return () => {
      stopScroll()
      stopResize()
    }
  })

  $effect(() => {
    if (!svg || !onbackgroundclick) return
    return on(svg, 'click', (event) => {
      if (event.target === event.currentTarget) onbackgroundclick?.()
    })
  })

  const projection = $derived(
    geoIdentity()
      .reflectY(true)
      .fitExtent(
        [
          [padding, padding],
          [width - padding, height - padding],
        ],
        geometry,
      ),
  )
  const path = $derived(geoPath(projection).digits(2))
  const transform = $derived.by(() => {
    if (!focus) return
    const [[left, top], [right, bottom]] = path.bounds(focus)
    const zoom = Math.min(
      (width - 2 * padding) / (right - left),
      (height - 2 * padding) / (bottom - top),
    )
    if (!Number.isFinite(zoom) || zoom <= 0) return
    const x = (width - zoom * (left + right)) / 2
    const y = (height - zoom * (top + bottom)) / 2
    return `translate(${x}px, ${y}px) scale(${zoom})`
  })
</script>

<svg
  bind:this={svg}
  viewBox="0 0 {width} {height}"
  {preserveAspectRatio}
  role={label ? 'group' : undefined}
  aria-label={label}
  aria-hidden={label ? undefined : true}
  {style}
  onpointermove={tooltip ? trackPointer : undefined}
  onpointerleave={tooltip
    ? (event) => {
        if (event.pointerType !== 'touch') dismissTooltip()
      }
    : undefined}
  onpointerdown={tooltip ? dismissTooltip : undefined}
  onfocusin={tooltip ? showFocusedTooltip : undefined}
  onfocusout={tooltip ? dismissTooltip : undefined}
>
  <g
    bind:this={mapLayer}
    style:transform
    ontransitionrun={updateZoom}
    ontransitionend={updateZoom}
    ontransitioncancel={updateZoom}
  >
    {@render children(path)}
  </g>
</svg>

{#if tooltip && tooltipKey && tooltipAnchor && !zooming}
  <TooltipOverlay
    id={tooltipId}
    title={tooltipTitle?.(tooltipKey)}
    x={tooltipAnchor.x}
    y={tooltipAnchor.y}
    bounds={tooltipBounds}
  >
    {@render tooltip(tooltipKey)}
  </TooltipOverlay>
{/if}

<style>
  svg {
    display: block;
    width: 100%;
    overflow: hidden;
  }

  g {
    transform-origin: 0 0;
    transition: transform 420ms ease-in-out;
  }

  @media (prefers-reduced-motion: reduce) {
    g {
      transition: none;
    }
  }
</style>
