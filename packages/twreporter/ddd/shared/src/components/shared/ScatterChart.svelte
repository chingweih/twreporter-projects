<script lang="ts">
  const clipId = $props.id()
  import { linearRegression } from '../../utils/linear-regression.ts'
  import { verticalLabelParts } from '../../utils/vertical-label.ts'
  import { scaleLinear } from 'd3-scale'
  import Legend from './Legend.svelte'
  import TooltipOverlay from './TooltipOverlay.svelte'
  import TooltipRows from './TooltipRows.svelte'

  type Point = { series: string; x: number; y: number; label?: string }
  const {
    label,
    data,
    colors = {},
    chartBackdrop = true,
    showLegend = true,
    showTooltip = true,
    showXAxis = true,
    showYAxis = true,
    showXGrid = true,
    showYGrid = true,
    hoverFocusXAxis = true,
    hoverFocusYAxis = true,
    pointRadius = 4,
    showTrendLine = false,
    xLabel,
    yLabel,
    yLabelHorizontalTexts = [],
    xDomain,
    yDomain,
    xTickCount = 5,
    yTickCount = 5,
    formatX = String,
    formatY = String,
  }: {
    label: string
    data: readonly Point[]
    colors?: Record<string, string>
    chartBackdrop?: boolean
    showLegend?: boolean
    showTooltip?: boolean
    showXAxis?: boolean
    showYAxis?: boolean
    showXGrid?: boolean
    showYGrid?: boolean
    hoverFocusXAxis?: boolean
    hoverFocusYAxis?: boolean
    showTrendLine?: boolean
    pointRadius?: number
    xLabel?: string
    yLabel?: string
    yLabelHorizontalTexts?: readonly string[]
    xDomain?: [number, number]
    yDomain?: [number, number]
    xTickCount?: number
    yTickCount?: number
    formatX?: (value: number) => string
    formatY?: (value: number) => string
  } = $props()
  let width = $state(0)
  let height = $state(0)
  let active = $state<string>()
  let hovered = $state.raw<Point>()
  let pointer = $state({ x: 0, y: 0 })
  const points = $derived(
    data.filter((p) => Number.isFinite(p.x) && Number.isFinite(p.y)),
  )
  const palette = [
    'var(--chart-olive-3)',
    'var(--chart-blue-3)',
    'var(--chart-earth-3)',
    'var(--chart-mint-3)',
  ]
  const items = $derived(
    [...new Set(points.map((p) => p.series))].map((series, i) => ({
      label: series,
      color: colors[series] ?? palette[i % palette.length],
    })),
  )
  const color = (series: string) =>
    items.find((item) => item.label === series)?.color
  function domain(
    values: number[],
    explicit?: [number, number],
  ): [number, number] {
    const lo = explicit?.[0] ?? Math.min(0, ...values)
    const hi = explicit?.[1] ?? Math.max(0, ...values)
    return lo === hi ? [lo, lo + 1] : [lo, hi]
  }
  const yScale = $derived(
    scaleLinear()
      .domain(
        domain(
          points.map((p) => p.y),
          yDomain,
        ),
      )
      .range([Math.max(8, height - (showXAxis ? 26 : 8)), 10]),
  )
  const yTicks = $derived(yScale.ticks(yTickCount))
  const left = $derived(
    showYAxis
      ? Math.max(12, ...yTicks.map((t) => formatY(t).length * 8 + 8))
      : 8,
  )
  const xScale = $derived(
    scaleLinear()
      .domain(
        domain(
          points.map((p) => p.x),
          xDomain,
        ),
      )
      .range([left, Math.max(left, width - 22)]),
  )
  const xTicks = $derived(xScale.ticks(xTickCount))
  const trend = $derived(linearRegression(points))
  function nearest(ticks: number[], value: number) {
    return ticks.reduce(
      (a, b) => (Math.abs(b - value) < Math.abs(a - value) ? b : a),
      ticks[0],
    )
  }
  function focus(point: Point, x: number, y: number) {
    hovered = point
    pointer = { x, y }
  }
</script>

<div class="chart" class:plain={!chartBackdrop}>
  {#if showLegend && items.length > 1}<Legend
      {items}
      active={active ?? hovered?.series}
      onhover={(value) => (active = value)}
    />{/if}
  <div class="chart-body">
    {#if showYAxis && yLabel}<div class="y-label">
        {#each verticalLabelParts(yLabel, yLabelHorizontalTexts) as part}
          {#if part.horizontal}<span class="horizontal-text">{part.text}</span
            >{:else}{part.text}{/if}
        {/each}
      </div>{/if}
    <div class="plot" bind:clientWidth={width} bind:clientHeight={height}>
      <svg role="img" aria-label={label}>
        {#each xTicks as tick}
          {#if showXGrid}<line
              class="grid"
              x1={xScale(tick)}
              x2={xScale(tick)}
              y1={10}
              y2={yScale.range()[0]}
            />{/if}
          {#if showXAxis}<text
              class:dimmed={hoverFocusXAxis &&
                !!hovered &&
                tick !== nearest(xTicks, hovered.x)}
              class:focused={hoverFocusXAxis &&
                !!hovered &&
                tick === nearest(xTicks, hovered.x)}
              x={xScale(tick)}
              y={height - 5}
              text-anchor="middle">{formatX(tick)}</text
            >{/if}
        {/each}
        {#each yTicks as tick}
          {#if showYGrid}<line
              class="grid"
              x1={left}
              x2={xScale.range()[1]}
              y1={yScale(tick)}
              y2={yScale(tick)}
            />{/if}
          {#if showYAxis}<text
              class:dimmed={hoverFocusYAxis &&
                !!hovered &&
                tick !== nearest(yTicks, hovered.y)}
              class:focused={hoverFocusYAxis &&
                !!hovered &&
                tick === nearest(yTicks, hovered.y)}
              x={left - 8}
              y={yScale(tick)}
              text-anchor="end"
              dominant-baseline="middle">{formatY(tick)}</text
            >{/if}
        {/each}
        {#if showXAxis}<line
            class="baseline"
            x1={left}
            x2={xScale.range()[1]}
            y1={yScale.range()[0]}
            y2={yScale.range()[0]}
          />{/if}
        {#if showYAxis}<line
            class="baseline"
            x1={left}
            x2={left}
            y1={10}
            y2={yScale.range()[0]}
          />{/if}
        {#if showTrendLine && trend}
          <defs
            ><clipPath id={clipId}
              ><rect
                x={left}
                y={10}
                width={Math.max(0, xScale.range()[1] - left)}
                height={Math.max(0, yScale.range()[0] - 10)}
              /></clipPath
            ></defs
          >
          <line
            class="indicator trend-line"
            clip-path={`url(#${clipId})`}
            x1={xScale(xScale.domain()[0])}
            y1={yScale(trend.slope * xScale.domain()[0] + trend.intercept)}
            x2={xScale(xScale.domain()[1])}
            y2={yScale(trend.slope * xScale.domain()[1] + trend.intercept)}
          />
        {/if}
        {#if hovered}
          <path
            class="indicator"
            d={`M ${left} ${yScale(hovered.y)} H ${xScale(hovered.x)} V ${yScale.range()[0]}`}
          />
        {/if}
        {#each points as point}
          <g
            role="button"
            tabindex="0"
            aria-label={`${point.label ?? point.series} ${xLabel ?? 'X'} ${formatX(point.x)} ${yLabel ?? 'Y'} ${formatY(point.y)}`}
            class="point"
            class:dimmed={active
              ? point.series !== active
              : !!hovered && hovered !== point}
            onpointerenter={(e) => {
              if (e.pointerType !== 'touch') focus(point, e.clientX, e.clientY)
            }}
            onpointermove={(e) => {
              if (hovered === point) pointer = { x: e.clientX, y: e.clientY }
            }}
            onpointerleave={() => (hovered = undefined)}
            onclick={(e) => focus(point, e.clientX, e.clientY)}
            onfocus={(e) => {
              const r = e.currentTarget.getBoundingClientRect()
              focus(point, r.x + r.width / 2, r.bottom)
            }}
            onblur={() => (hovered = undefined)}
            onkeydown={(e) => {
              if (e.key === 'Escape') hovered = undefined
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault()
                const r = e.currentTarget.getBoundingClientRect()
                focus(point, r.x + r.width / 2, r.bottom)
              }
            }}
          >
            <circle
              cx={xScale(point.x)}
              cy={yScale(point.y)}
              r={Math.max(8, pointRadius)}
              fill="transparent"
            />
            <circle
              cx={xScale(point.x)}
              cy={yScale(point.y)}
              r={hovered === point ? pointRadius + 1 : pointRadius}
              fill={color(point.series)}
            />
          </g>
        {/each}
      </svg>
    </div>
  </div>
  {#if showXAxis && xLabel}<div class="x-label">{xLabel}</div>{/if}
</div>
{#if showTooltip && hovered}<TooltipOverlay
    title={hovered.label ?? hovered.series}
    x={pointer.x}
    y={pointer.y}
  >
    <TooltipRows
      rows={[
        { label: xLabel ?? 'X', value: formatX(hovered.x) },
        {
          label: yLabel ?? hovered.series,
          value: formatY(hovered.y),
          color: color(hovered.series),
        },
      ]}
    />
  </TooltipOverlay>{/if}

<style>
  .chart {
    display: flex;
    flex-direction: column;
    min-width: 0;
    min-height: 0;
    height: var(--scatter-chart-height, 100%);
    padding: 12px 8px 8px;
    gap: 7px;
    background: var(--neutral-gray-50);
    color: var(--text-color);
    font-size: var(--text-xs);
    box-sizing: border-box;
  }
  .plain {
    padding: 0;
    background: transparent;
  }
  .chart-body {
    display: flex;
    flex: 1 1 auto;
    min-height: 0;
    min-width: 0;
    gap: 4px;
    align-items: center;
  }
  .horizontal-text {
    transform: translateX(1px);
    display: inline-block;
    writing-mode: vertical-rl;
    text-orientation: sideways;
  }
  .y-label {
    display: flex;
    align-items: center;
    gap: 0.075em;
    writing-mode: vertical-rl;
    text-orientation: upright;
    flex-shrink: 0;
    letter-spacing: 0.075em;
  }
  .x-label {
    text-align: center;
    letter-spacing: 0.025em;
  }
  .plot {
    position: relative;
    flex: 1 1 auto;
    min-width: 0;
    min-height: 0;
    align-self: stretch;
    aspect-ratio: var(--scatter-chart-aspect-ratio, 4 / 3);
  }
  svg {
    position: absolute;
    inset: 0;
    width: 100%;
    height: 100%;
    overflow: visible;
  }
  .grid {
    stroke: var(--neutral-gray-300);
    pointer-events: none;
  }
  .baseline {
    stroke: var(--neutral-gray-500);
    pointer-events: none;
  }
  .indicator {
    stroke: var(--neutral-gray-500);
    stroke-dasharray: 2 2;
    fill: none;
    pointer-events: none;
  }
  text {
    fill: var(--neutral-gray-700);
    transition: opacity 150ms ease;
  }
  .focused {
    font-weight: 700;
    fill: var(--text-color);
  }
  .point {
    cursor: pointer;
    transition: opacity 150ms ease;
  }
  .dimmed {
    opacity: 0.25;
  }
  .point:focus-visible {
    outline: none;
  }
  .point:focus-visible circle:last-child {
    stroke: var(--text-color);
    stroke-width: 2;
  }
  @media (prefers-reduced-motion: reduce) {
    .point,
    text {
      transition: none;
    }
  }
</style>
