<script lang="ts">
  const gradientId = $props.id()
  import { verticalLabelParts } from '../../utils/vertical-label.ts'
  import { scaleLinear } from 'd3-scale'
  import Legend from './Legend.svelte'
  import TooltipOverlay from './TooltipOverlay.svelte'
  import TooltipRows from './TooltipRows.svelte'

  const {
    label,
    data,
    colors = {},
    pointColor,
    lineSegmentStyle,
    showArea = false,
    showTooltip = true,
    showValue = false,
    showXAxis = true,
    hoverFocusXAxis = true,
    hoverFocusYAxis = true,
    showYAxis = true,
    showXGrid = false,
    gridHover = true,
    showYGrid = true,
    chartBackdrop = true,
    xLabel,
    yLabel,
    yLabelHorizontalTexts = [],
    xDomain,
    yDomain,
    xTickCount = 6,
    showAllXTicks = false,
    yTickCount = 5,
    connectGaps = true,
    gapDasharray = '6 4',
    lineWidth = 4,
    linePointRadius = 4.5,
    formatX = String,
    formatValue = String,
  }: {
    label: string
    data: readonly { series: string; x: number; value: number | null }[]
    colors?: Record<string, string>
    pointColor?: (series: string, x: number) => string | undefined
    lineSegmentStyle?: (
      series: string,
      fromX: number,
      toX: number,
    ) => { color?: string; dasharray?: string } | undefined
    showArea?: boolean
    showTooltip?: boolean
    showValue?: boolean | ((series: string, x: number) => boolean)
    showXAxis?: boolean
    hoverFocusXAxis?: boolean
    hoverFocusYAxis?: boolean
    showYAxis?: boolean
    showXGrid?: boolean
    gridHover?: boolean
    showYGrid?: boolean
    chartBackdrop?: boolean
    xLabel?: string
    yLabel?: string
    yLabelHorizontalTexts?: readonly string[]
    xDomain?: [number, number]
    yDomain?: [number, number]
    xTickCount?: number
    showAllXTicks?: boolean
    connectGaps?: boolean
    gapDasharray?: string
    lineWidth?: number
    linePointRadius?: number
    yTickCount?: number
    formatX?: (value: number) => string
    formatValue?: (value: number) => string
  } = $props()

  let width = $state(0)
  let height = $state(0)
  let active = $state<string>()
  let hoveredLine = $state<string>()
  let hovered = $state<{
    x: number
    y: number
    series: string
    pointX: number
    value: number
    rows?: readonly { series: string; value: number }[]
  }>()
  const palette = [
    'var(--chart-olive-3)',
    'var(--chart-blue-3)',
    'var(--chart-earth-3)',
    'var(--chart-mint-3)',
  ]
  const validData = $derived(
    data.filter(
      (point): point is { series: string; x: number; value: number } =>
        point.value !== null &&
        Number.isFinite(point.x) &&
        Number.isFinite(point.value),
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
      segments: segmentsFor(item.label),
      points: validData
        .filter((point) => point.series === item.label)
        .sort((a, b) => a.x - b.x),
    })),
  )
  function segmentsFor(series: string) {
    const segments: { x: number; value: number }[][] = []
    let current: { x: number; value: number }[] = []
    for (const point of data
      .filter((point) => point.series === series)
      .sort((a, b) => a.x - b.x)) {
      if (
        point.value === null ||
        !Number.isFinite(point.value) ||
        !Number.isFinite(point.x)
      ) {
        current = []
      } else {
        if (!current.length) segments.push(current)
        current.push({ x: point.x, value: point.value })
      }
    }
    return segments
  }
  const xValues = $derived(
    [...new Set(data.map((point) => point.x).filter(Number.isFinite))].sort(
      (a, b) => a - b,
    ),
  )
  const xExtent = $derived(
    xDomain ??
      (xValues.length ? [xValues[0], xValues[xValues.length - 1]] : [0, 1]),
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
  const valueLabelPositions = $derived.by(() => {
    const positions = new Map<(typeof validData)[number], number>()
    for (const x of xValues) {
      const points = validData
        .filter((point) => point.x === x)
        .sort((a, b) => yScale(a.value) - yScale(b.value))
      let previous = -Infinity
      for (const point of points) {
        const pointY = yScale(point.value)
        const above = pointY - 13
        const y =
          above - previous < 20 ? Math.max(pointY + 24, previous + 20) : above
        positions.set(point, y)
        previous = y
      }
    }
    return positions
  })
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
    showAllXTicks
      ? xValues
      : xValues.filter(
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
  const focused = $derived(
    active ?? (hovered?.rows ? undefined : (hovered?.series ?? hoveredLine)),
  )
  function focusedYTick(tick: number) {
    return (hovered?.rows ?? (hovered ? [hovered] : [])).some(
      (point) =>
        yTicks.reduce(
          (closest, candidate) =>
            Math.abs(candidate - point.value) < Math.abs(closest - point.value)
              ? candidate
              : closest,
          yTicks[0],
        ) === tick,
    )
  }
  function hoverTick(tick: number, x: number, y: number) {
    const rows = validData.filter((point) => point.x === tick)
    if (!rows.length) {
      hovered = undefined
      return
    }
    hovered = {
      x,
      y,
      pointX: tick,
      series: rows[0].series,
      value: rows[0].value,
      rows,
    }
  }
  function path(points: readonly { x: number; value: number }[]) {
    return points
      .map(
        (point, index) =>
          `${index ? 'L' : 'M'}${xScale(point.x)},${yScale(point.value)}`,
      )
      .join(' ')
  }
</script>

<div
  class="chart"
  class:plain={!chartBackdrop}
  class:axis-hovered={hovered !== undefined}
>
  {#if items.length > 1}<Legend
      {items}
      active={focused ?? hovered?.rows?.map((row) => row.series)}
      onhover={(name) => (active = name)}
    />{/if}
  <div class="chart-body">
    {#if showYAxis && yLabel}
      <div class="axis-label y-label">
        {#each verticalLabelParts(yLabel, yLabelHorizontalTexts) as part}
          {#if part.horizontal}
            <span class="horizontal-text">{part.text}</span>
          {:else}
            {part.text}
          {/if}
        {/each}
      </div>
    {/if}
    <div class="plot" bind:clientWidth={width} bind:clientHeight={height}>
      <svg viewBox={`0 0 ${width} ${height}`} role="img" aria-label={label}>
        {#if validData.length && width > left && height > 36}
          {#if showXGrid}
            {#each xTicks as tick}
              <g
                role="group"
                aria-label={formatX(tick)}
                onpointerenter={(event) =>
                  hoverTick(tick, event.clientX, event.clientY)}
                onpointermove={(event) =>
                  hoverTick(tick, event.clientX, event.clientY)}
                onpointerleave={() => (hovered = undefined)}
              >
                <line
                  class="grid x-grid"
                  x1={xScale(tick)}
                  x2={xScale(tick)}
                  y1={10}
                  y2={yScale.range()[0]}
                />
                {#if gridHover}<line
                    class="x-grid-hit"
                    x1={xScale(tick)}
                    x2={xScale(tick)}
                    y1={10}
                    y2={yScale.range()[0]}
                  />{/if}
              </g>
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
                class:axis-focused={focusedYTick(tick)}
                class:axis-focus-disabled={!hoverFocusYAxis}
                class="axis-tick"
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
            {#each xTicks as tick}
              <g
                role="button"
                tabindex="0"
                aria-label={`查看 ${formatX(tick)}`}
                onpointerenter={(event) =>
                  hoverTick(tick, event.clientX, event.clientY)}
                onpointermove={(event) =>
                  hoverTick(tick, event.clientX, event.clientY)}
                onpointerleave={() => (hovered = undefined)}
                onfocus={(event) => {
                  const bounds = event.currentTarget.getBoundingClientRect()
                  hoverTick(tick, bounds.x + bounds.width / 2, bounds.bottom)
                }}
                onblur={() => (hovered = undefined)}
                onkeydown={(event) => {
                  if (event.key === 'Escape') hovered = undefined
                }}
              >
                <text
                  class:axis-focused={hovered?.pointX === tick}
                  class:axis-focus-disabled={!hoverFocusXAxis}
                  class="axis-tick"
                  x={xScale(tick)}
                  y={height - 4}
                  text-anchor="middle">{formatX(tick)}</text
                >
              </g>
            {/each}
          {/if}
          {#if hovered}
            <line
              class="hover-indicator"
              x1={xScale(hovered.pointX)}
              x2={xScale(hovered.pointX)}
              y1={yScale.range()[1]}
              y2={yScale.range()[0]}
            />
          {/if}
          {#each groups as group, index}
            <g
              opacity={(focused !== undefined && focused !== group.label) ||
              (focused === undefined &&
                hovered?.rows !== undefined &&
                !hovered.rows.some((row) => row.series === group.label))
                ? 0.25
                : 1}
            >
              {#each connectGaps ? group.segments.slice(1) : [] as segment, segmentIndex}
                {@const previous = group.segments[segmentIndex]}
                <path
                  d={path([previous[previous.length - 1], segment[0]])}
                  fill="none"
                  stroke={group.color}
                  stroke-width={lineWidth}
                  stroke-dasharray="1 10"
                  stroke-linecap="round"
                />
              {/each}
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
                {#each group.segments as segment}
                  <path
                    d={`${path(segment)} L${xScale(segment[segment.length - 1].x)},${yScale(Math.max(yExtent[0], Math.min(yExtent[1], 0)))} L${xScale(segment[0].x)},${yScale(Math.max(yExtent[0], Math.min(yExtent[1], 0)))} Z`}
                    fill={`url(#${gradientId}-area-${index})`}
                  />
                {/each}
              {/if}
              {#each group.segments as segment}
                <g
                  role="group"
                  aria-label={group.label}
                  onpointerenter={() => {
                    hoveredLine = group.label
                    hovered = undefined
                  }}
                  onpointerleave={() => (hoveredLine = undefined)}
                >
                  <path class="line-hit" d={path(segment)} />
                </g>
                {#each lineSegmentStyle && segment.length > 1 ? segment
                      .slice(1)
                      .map( (point, index) => [segment[index], point], ) : [segment] as part}
                  {@const style = lineSegmentStyle?.(
                    group.label,
                    part[0].x,
                    part[part.length - 1].x,
                  )}
                  <path
                    d={path(part)}
                    fill="none"
                    stroke={style?.color ?? group.color}
                    stroke-dasharray={style?.dasharray}
                    stroke-width={lineWidth}
                    stroke-linejoin="round"
                    stroke-linecap="round"
                  />
                {/each}
              {/each}
              {#each group.points as point}
                <g
                  style:--point-hover-radius={`${linePointRadius + 0.5}px`}
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
                    r={Math.max(10, linePointRadius + 5.5)}
                    fill="transparent"
                  />
                  <circle
                    class="point-ring"
                    cx={xScale(point.x)}
                    cy={yScale(point.value)}
                    r={linePointRadius + 3.5}
                    stroke={pointColor?.(group.label, point.x) ?? group.color}
                  />
                  <circle
                    cx={xScale(point.x)}
                    cy={yScale(point.value)}
                    r={linePointRadius}
                    fill={pointColor?.(group.label, point.x) ?? group.color}
                  />
                </g>
              {/each}
            </g>
          {/each}
          {#each groups as group}
            <g
              opacity={(focused !== undefined && focused !== group.label) ||
              (focused === undefined &&
                hovered?.rows !== undefined &&
                !hovered.rows.some((row) => row.series === group.label))
                ? 0.25
                : 1}
            >
              {#each group.points as point, pointIndex}
                {#if (typeof showValue === 'function' ? showValue(group.label, point.x) : showValue) || hoveredLine === group.label || (hovered?.pointX === point.x && (hovered.rows !== undefined || hovered.series === group.label))}
                  <text
                    class="value"
                    style:fill={pointColor?.(group.label, point.x) ??
                      group.color}
                    class:dimmed={hovered
                      ? !(
                          hovered.pointX === point.x &&
                          (hovered.rows !== undefined ||
                            hovered.series === group.label)
                        )
                      : hoveredLine !== undefined &&
                        hoveredLine !== group.label}
                    class:highlighted={hovered?.pointX === point.x &&
                      (hovered.rows !== undefined ||
                        hovered.series === group.label)}
                    x={xScale(point.x)}
                    y={valueLabelPositions.get(point)}
                    text-anchor={pointIndex === 0
                      ? 'start'
                      : pointIndex === group.points.length - 1
                        ? 'end'
                        : 'middle'}
                    pointer-events="none">{formatValue(point.value)}</text
                  >
                {/if}
              {/each}
            </g>
          {/each}
        {/if}
      </svg>
    </div>
  </div>
  {#if showXAxis && xLabel}<div class="axis-label bottom">{xLabel}</div>{/if}
</div>
{#if showTooltip && hovered}<TooltipOverlay
    x={hovered.x}
    y={hovered.y}
    title={formatX(hovered.pointX)}
    ><TooltipRows
      rows={(hovered.rows ?? [hovered]).map((row) => ({
        label: row.series,
        value: formatValue(row.value),
        color: items.find((item) => item.label === row.series)?.color,
      }))}
    /></TooltipOverlay
  >{/if}

<style>
  .axis-focused:not(.axis-focus-disabled) {
    font-weight: 700;
    fill: var(--text-color);
  }
  .axis-tick {
    transition: opacity 150ms ease;
  }
  .axis-hovered .axis-tick:not(.axis-focused):not(.axis-focus-disabled) {
    opacity: 0.25;
  }
  @media (prefers-reduced-motion: reduce) {
    .axis-tick {
      transition: none;
    }
  }
  .hover-indicator {
    stroke: var(--neutral-gray-500);
    stroke-width: 1px;
    stroke-dasharray: 2 2;
    pointer-events: none;
  }
  .baseline {
    stroke: var(--neutral-gray-500);
    pointer-events: none;
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
    --y-label-horizontal-offset: 1px;
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
  .horizontal-text {
    transform: translateX(1px);
    display: inline-block;
    writing-mode: vertical-rl;
    text-orientation: sideways;
    letter-spacing: 0;
  }
  .y-label {
    display: flex;
    align-items: center;
    flex-shrink: 0;
    writing-mode: vertical-rl;
    text-orientation: upright;
    letter-spacing: 0.05em;
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
    transition: opacity 150ms ease;
    paint-order: stroke;
    stroke-opacity: 0.7;
    stroke: var(--neutral-gray-50);
    stroke-width: 4px;
    stroke-linejoin: round;
  }
  .plain .value {
    stroke: var(--background, var(--neutral-white, #fff));
  }
  .value.highlighted {
    font-weight: 500;
  }
  .value.dimmed {
    opacity: 0.25;
  }
  .grid {
    stroke: var(--neutral-gray-300);
    pointer-events: none;
  }
  .x-grid-hit {
    stroke: transparent;
    stroke-width: 16px;
    pointer-events: stroke;
  }
  path {
    pointer-events: none;
  }
  .line-hit {
    fill: none;
    stroke: transparent;
    stroke-width: 12px;
    pointer-events: stroke;
  }
  .x-grid {
    stroke: var(--neutral-gray-200);
  }
  .axis-label {
    color: var(--neutral-gray-700);
    letter-spacing: 0.025em;
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
  .point-ring {
    fill: var(--neutral-gray-50);
    stroke-width: 2px;
    opacity: 0;
    pointer-events: none;
  }
  .plain .point-ring {
    fill: var(--background, var(--neutral-white, #fff));
  }
  g[role='button']:hover .point-ring,
  g[role='button']:focus .point-ring {
    opacity: 1;
  }
  g[role='button']:hover circle:last-child,
  g[role='button']:focus circle:last-child {
    r: var(--point-hover-radius);
  }
  @media (prefers-reduced-motion: reduce) {
    .value {
      transition: none;
    }
    g {
      transition: none;
    }
  }
</style>
