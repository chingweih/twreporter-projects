<script lang="ts">
  const gradientId = $props.id()
  import { scaleLinear } from 'd3-scale'
  import Legend from './Legend.svelte'
  import TooltipOverlay from './TooltipOverlay.svelte'

  const {
    label,
    data,
    colors = {},
    showArea = false,
    showValue = false,
    showXAxis = true,
    showYAxis = true,
    showXGrid = false,
    showYGrid = true,
    chartBackdrop = true,
    xLabel,
    yLabel,
    xDomain,
    yDomain,
    xTickCount = 6,
    yTickCount = 5,
    formatX = String,
    formatValue = String,
  }: {
    label: string
    data: readonly { series: string; x: number; value: number }[]
    colors?: Record<string, string>
    showArea?: boolean
    showValue?: boolean
    showXAxis?: boolean
    showYAxis?: boolean
    showXGrid?: boolean
    showYGrid?: boolean
    chartBackdrop?: boolean
    xLabel?: string
    yLabel?: string
    xDomain?: [number, number]
    yDomain?: [number, number]
    xTickCount?: number
    yTickCount?: number
    formatX?: (value: number) => string
    formatValue?: (value: number) => string
  } = $props()

  let width = $state(0)
  let height = $state(0)
  let active = $state<string>()
  let hovered = $state<{
    x: number
    y: number
    series: string
    pointX: number
    value: number
  }>()
  const palette = [
    'var(--chart-olive-3)',
    'var(--chart-blue-3)',
    'var(--chart-earth-3)',
    'var(--chart-mint-3)',
  ]
  const validData = $derived(
    data.filter(
      (point) => Number.isFinite(point.x) && Number.isFinite(point.value),
    ),
  )
  const series = $derived([...new Set(validData.map((point) => point.series))])
  const items = $derived(
    series.map((name, index) => ({
      label: name,
      color: colors[name] ?? palette[index % palette.length],
    })),
  )
  const groups = $derived(
    items.map((item) => ({
      ...item,
      points: validData
        .filter((point) => point.series === item.label)
        .sort((a, b) => a.x - b.x),
    })),
  )
  const xExtent = $derived(
    xDomain ??
      (validData.length
        ? [
            Math.min(...validData.map((point) => point.x)),
            Math.max(...validData.map((point) => point.x)),
          ]
        : [0, 1]),
  )
  const yExtent = $derived(
    yDomain ?? [
      Math.min(0, ...validData.map((point) => point.value)),
      Math.max(0, ...validData.map((point) => point.value)),
    ],
  )
  const yScale = $derived(
    scaleLinear()
      .domain(
        yExtent[0] === yExtent[1] ? [yExtent[0], yExtent[0] + 1] : yExtent,
      )
      .range([Math.max(0, height - (showXAxis ? 26 : 4)), showValue ? 26 : 10]),
  )
  const yTicks = $derived(yScale.ticks(yTickCount))
  const left = $derived(
    Math.max(
      4,
      ...(showValue
        ? validData.map((point) => formatValue(point.value).length * 4)
        : []),
      showXAxis ? formatX(xExtent[0]).length * 4 : 0,
      ...(showYAxis
        ? yTicks.map((tick) => formatValue(tick).length * 8 + 8)
        : []),
    ),
  )
  const right = $derived(
    Math.max(
      showXAxis ? Math.max(8, formatX(xExtent[1] ?? 0).length * 4) : 4,
      ...(showValue
        ? validData.map((point) => formatValue(point.value).length * 4)
        : []),
    ),
  )
  const xScale = $derived(
    scaleLinear()
      .domain(
        xExtent[0] === xExtent[1] ? [xExtent[0] - 1, xExtent[0] + 1] : xExtent,
      )
      .range([left, Math.max(left, width - right)]),
  )
  const xTicks = $derived(
    [...new Set(validData.map((point) => point.x))]
      .sort((a, b) => a - b)
      .filter(
        (_, index, ticks) =>
          index %
            Math.max(
              1,
              Math.ceil(
                ticks.length /
                  Math.max(
                    1,
                    Math.min(
                      xTickCount,
                      Math.floor((width - left - right) / 70),
                    ),
                  ),
              ),
            ) ===
            0 || index === ticks.length - 1,
      ),
  )
  const focused = $derived(active ?? hovered?.series)
  function path(points: readonly { x: number; value: number }[]) {
    return points
      .map(
        (point, index) =>
          `${index ? 'L' : 'M'}${xScale(point.x)},${yScale(point.value)}`,
      )
      .join(' ')
  }
</script>

<div class="chart" class:plain={!chartBackdrop}>
  {#if items.length > 1}<Legend
      {items}
      active={focused}
      onhover={(name) => (active = name)}
    />{/if}
  <div class="chart-body">
    {#if showYAxis && yLabel}<div class="axis-label y-label">{yLabel}</div>{/if}
    <div class="plot" bind:clientWidth={width} bind:clientHeight={height}>
      <svg viewBox={`0 0 ${width} ${height}`} role="img" aria-label={label}>
        <title>{label}</title>
        {#if validData.length && width > left && height > 36}
          {#if showXGrid}
            {#each xTicks as tick}
              <line
                class="grid x-grid"
                x1={xScale(tick)}
                x2={xScale(tick)}
                y1={10}
                y2={yScale.range()[0]}
              />
            {/each}
          {/if}
          {#if showYGrid}
            {#each yTicks as tick}
              <line
                class="grid y-grid"
                x1={left}
                x2={width - right}
                y1={yScale(tick)}
                y2={yScale(tick)}
              />
            {/each}
          {/if}
          {#if showYAxis}
            <line
              class="baseline y-axis"
              x1={left}
              x2={left}
              y1={10}
              y2={yScale.range()[0]}
            />
            {#each yTicks as tick}
              <text
                x={left - 8}
                y={yScale(tick)}
                text-anchor="end"
                dominant-baseline="middle">{formatValue(tick)}</text
              >
            {/each}
          {/if}
          {#if showXAxis}
            <line
              class="baseline x-axis"
              x1={left}
              x2={width - right}
              y1={yScale.range()[0]}
              y2={yScale.range()[0]}
            />
            {#each xTicks as tick}<text
                x={xScale(tick)}
                y={height - 4}
                text-anchor="middle">{formatX(tick)}</text
              >{/each}
          {/if}
          {#each groups as group, index}
            <g
              opacity={focused !== undefined && focused !== group.label
                ? 0.5
                : 1}
            >
              {#if showArea && group.points.length > 1}
                <defs>
                  <linearGradient
                    id={`${gradientId}-area-${index}`}
                    x1="0"
                    y1="0"
                    x2="0"
                    y2="1"
                  >
                    <stop
                      offset="0%"
                      stop-color={group.color}
                      stop-opacity="0.5"
                    />
                    <stop
                      offset="100%"
                      stop-color={group.color}
                      stop-opacity="0"
                    />
                  </linearGradient>
                </defs>
                <path
                  d={`${path(group.points)} L${xScale(group.points[group.points.length - 1].x)},${yScale(Math.max(yExtent[0], Math.min(yExtent[1], 0)))} L${xScale(group.points[0].x)},${yScale(Math.max(yExtent[0], Math.min(yExtent[1], 0)))} Z`}
                  fill={`url(#${gradientId}-area-${index})`}
                />
              {/if}
              <path
                d={path(group.points)}
                fill="none"
                stroke={group.color}
                stroke-width="2"
                stroke-linejoin="round"
                stroke-linecap="round"
              />
              {#each group.points as point, pointIndex}
                {#if showValue}
                  <text
                    class="value"
                    x={xScale(point.x)}
                    y={yScale(point.value) - 10}
                    text-anchor={pointIndex === 0
                      ? 'start'
                      : pointIndex === group.points.length - 1
                        ? 'end'
                        : 'middle'}
                    pointer-events="none">{formatValue(point.value)}</text
                  >
                {/if}
                <g
                  role="button"
                  tabindex="0"
                  aria-label={`${group.label} ${formatX(point.x)} ${formatValue(point.value)}`}
                  onpointerenter={(event) =>
                    (hovered = {
                      x: event.clientX,
                      y: event.clientY,
                      series: group.label,
                      pointX: point.x,
                      value: point.value,
                    })}
                  onpointermove={(event) => {
                    if (hovered)
                      hovered = {
                        ...hovered,
                        x: event.clientX,
                        y: event.clientY,
                      }
                  }}
                  onpointerleave={() => (hovered = undefined)}
                  onfocus={(event) => {
                    const bounds = event.currentTarget.getBoundingClientRect()
                    hovered = {
                      x: bounds.x,
                      y: bounds.bottom,
                      series: group.label,
                      pointX: point.x,
                      value: point.value,
                    }
                  }}
                  onblur={() => (hovered = undefined)}
                  onkeydown={(event) => {
                    if (event.key === 'Escape') hovered = undefined
                  }}
                >
                  <circle
                    cx={xScale(point.x)}
                    cy={yScale(point.value)}
                    r="10"
                    fill="transparent"
                  />
                  <circle
                    cx={xScale(point.x)}
                    cy={yScale(point.value)}
                    r="3"
                    fill={group.color}
                  />
                </g>
              {/each}
            </g>
          {/each}
        {/if}
      </svg>
    </div>
  </div>
  {#if showXAxis && xLabel}<div class="axis-label bottom">{xLabel}</div>{/if}
</div>
{#if hovered}<TooltipOverlay
    x={hovered.x}
    y={hovered.y}
    title={formatX(hovered.pointX)}
    ><div>{hovered.series}：{formatValue(hovered.value)}</div></TooltipOverlay
  >{/if}

<style>
  .baseline {
    stroke: var(--neutral-gray-500);
  }
  .chart {
    display: flex;
    flex-direction: column;
    height: var(--line-chart-height, 100%);
    min-height: 0;
    min-width: 0;
    box-sizing: border-box;
    padding: 12px 8px 8px;
    gap: 7px;
    background: var(--neutral-gray-50);
    color: var(--text-color);
    font-size: var(--text-xs);
  }
  .chart.plain {
    padding: 0;
    background: transparent;
  }
  .chart-body {
    display: flex;
    align-items: center;
    flex: 1 1 auto;
    min-height: 0;
    min-width: 0;
    gap: 4px;
  }
  .y-label {
    flex-shrink: 0;
    writing-mode: vertical-rl;
    text-orientation: upright;
  }
  .plot {
    position: relative;
    flex: 1 1 auto;
    min-height: 0;
    min-width: 0;
    align-self: stretch;
    width: 100%;
    aspect-ratio: var(--line-chart-aspect-ratio, 4 / 3);
  }
  svg {
    position: absolute;
    inset: 0;
    width: 100%;
    height: 100%;
    display: block;
    overflow: visible;
  }
  text {
    fill: var(--neutral-gray-700);
  }
  .value {
    paint-order: stroke;
    stroke: var(--neutral-gray-50);
    stroke-width: 4px;
    stroke-linejoin: round;
  }
  .plain .value {
    stroke: var(--background, var(--neutral-white, #fff));
  }
  .grid {
    stroke: var(--neutral-gray-300);
  }
  .x-grid {
    stroke: var(--neutral-gray-200);
  }
  .axis-label {
    color: var(--neutral-gray-700);
  }
  .bottom {
    text-align: center;
  }
  g {
    transition: opacity 150ms ease;
  }
  g[role='button'] {
    cursor: pointer;
  }
  g[role='button']:hover circle:last-child,
  g[role='button']:focus circle:last-child {
    r: 5px;
  }
  @media (prefers-reduced-motion: reduce) {
    g {
      transition: none;
    }
  }
</style>
