<script lang="ts">
  import { scaleBand, scaleLinear } from 'd3-scale'
  import { onMount } from 'svelte'
  import { formatNumber } from '../../utils/format.ts'
  import TooltipOverlay from './TooltipOverlay.svelte'
  import Legend from './Legend.svelte'
  import type { BarChartBar, BarChartProps } from './types.ts'

  const descriptionId = $props.id()
  const annotationStep = 24
  const labelGap = 10
  const estimatedCharacterWidth = 8.5
  const estimatedWideCharacterWidth = 14

  const {
    label,
    groups,
    orientation = 'vertical',
    mode = 'grouped',
    chartBackdrop = true,
    barGap = 4,
    groupGap = 10,
    showXAxis = true,
    showValues = true,
    showTotals = true,
    valuePosition,
    xAxisFontSize,
    yAxisFontSize,
    colors = {},
    showLegend = true,
    annotations = [],
    axisLabel,
    valueSuffix = '',
    formatValue = (value) => formatNumber(value) + valueSuffix,
  }: BarChartProps = $props()

  let width = $state(0)
  let chartElement = $state<HTMLDivElement>()
  let measureContext = $state.raw<CanvasRenderingContext2D | null>(null)
  let fontFamily = $state('sans-serif')
  let themeFontSize = $state(14)
  onMount(() => {
    const context = document.createElement('canvas').getContext('2d')
    const updateFont = () => {
      if (!chartElement) return
      const style = getComputedStyle(chartElement)
      fontFamily = style.fontFamily
      themeFontSize = parseFloat(style.fontSize)
      measureContext = context
    }
    updateFont()
    void document.fonts.ready.then(() => {
      updateFont()
      measureContext = document.createElement('canvas').getContext('2d')
    })
    const observer = new ResizeObserver(updateFont)
    if (chartElement) observer.observe(chartElement)
    return () => observer.disconnect()
  })
  let containerHeight = $state(0)
  let hoveredSeries = $state<string>()
  const stacked = $derived(mode === 'stacked')
  const labelPosition = $derived(
    valuePosition ?? (stacked ? 'center' : 'outside'),
  )
  function labelsFor(bar: BarChartBar) {
    return (
      bar.valueLabels ?? [
        {
          text: bar.valueLabel ?? formatValue(bar.value),
          position: labelPosition,
        },
        ...(bar.outsideValueLabel && labelPosition !== 'outside'
          ? [{ text: bar.outsideValueLabel, position: 'outside' as const }]
          : []),
      ]
    )
  }
  let hovered = $state.raw<{
    x: number
    y: number
    labels: string
    bar: BarChartBar
    rows: readonly BarChartBar[]
  }>()
  const horizontal = $derived(orientation === 'horizontal')
  const nonemptyGroups = $derived(groups.filter((group) => group.bars.length))
  const bars = $derived(nonemptyGroups.flatMap((group) => group.bars))
  const series = $derived([...new Set(bars.map((bar) => bar.series))])
  const hasGroupLabels = $derived(nonemptyGroups.some((group) => group.label))
  const barLabels = $derived(bars.map((bar) => bar.label ?? ''))
  const hasBarLabels = $derived(!stacked && barLabels.some(Boolean))
  const gapWidth = $derived(
    stacked ? 0 : groupGap * Math.max(0, nonemptyGroups.length - 1),
  )
  const values = $derived([
    ...(stacked
      ? nonemptyGroups.flatMap((group) => [
          group.bars.reduce((sum, bar) => sum + Math.min(0, bar.value), 0),
          group.bars.reduce((sum, bar) => sum + Math.max(0, bar.value), 0),
        ])
      : bars.map((bar) => bar.value)),
    ...annotations.map((annotation) => annotation.value),
  ])
  const minValue = $derived(Math.min(0, ...values))
  const maxValue = $derived(Math.max(0, ...values))
  const valueDomainScale = $derived(
    scaleLinear([minValue, minValue === maxValue ? 1 : maxValue], [0, 1]).nice(
      6,
    ),
  )
  const negativeValueGutter = $derived(
    horizontal &&
      minValue < 0 &&
      bars.some((bar) =>
        labelsFor(bar).some((label) => label.position === 'outside'),
      ) &&
      showValues
      ? estimatedLabelWidth(
          values
            .filter((value) => value < 0)
            .map((value) => formatValue(value)),
        ) + labelGap
      : 0,
  )
  const barLabelGutter = $derived(
    horizontal && hasBarLabels
      ? estimatedLabelWidth(barLabels, yAxisFontSize) + labelGap
      : 0,
  )
  const groupLabelGutter = $derived(
    horizontal && hasGroupLabels
      ? estimatedLabelWidth(
          nonemptyGroups.map((group) => group.label ?? ''),
          yAxisFontSize,
        ) + labelGap
      : 0,
  )
  const leftGutter = $derived(
    horizontal
      ? groupLabelGutter + barLabelGutter + negativeValueGutter
      : estimatedLabelWidth(
          valueDomainScale.ticks(6).map((tick) => formatValue(tick)),
          yAxisFontSize,
        ) + labelGap,
  )
  const rightGutter = $derived(
    horizontal &&
      ((stacked && showTotals) ||
        (showValues &&
          bars.some((bar) =>
            labelsFor(bar).some((label) => label.position === 'outside'),
          )))
      ? estimatedLabelWidth([
          ...values
            .filter((value) => value >= 0)
            .map((value) => formatValue(value)),
          ...bars.flatMap((bar) =>
            labelsFor(bar)
              .filter((label) => label.position === 'outside')
              .map((label) => label.text),
          ),
        ]) + labelGap
      : 0,
  )
  const topGutter = $derived(
    horizontal ? annotations.length * annotationStep : 24,
  )
  const plotWidth = $derived(Math.max(0, width - leftGutter - rightGutter))
  const plotHeight = $derived(
    Math.max(
      0,
      containerHeight -
        topGutter -
        (showXAxis
          ? horizontal
            ? Math.max(22, (xAxisFontSize ?? themeFontSize) + 8)
            : Math.max(52, (xAxisFontSize ?? 14) * 2 + 24)
          : 0),
    ),
  )
  const categoryLabelY = $derived(
    plotHeight + Math.max(minValue < 0 ? 38 : 18, (xAxisFontSize ?? 14) + 4),
  )
  const height = $derived(containerHeight)
  const tickCount = $derived(horizontal && plotWidth < 260 ? 3 : 6)
  const valueScale = $derived(
    valueDomainScale
      .copy()
      .range(horizontal ? [0, plotWidth] : [plotHeight, 0]),
  )
  const ticks = $derived(valueScale.ticks(tickCount))
  const baseline = $derived(valueScale(0))
  const categoryCount = $derived(stacked ? nonemptyGroups.length : bars.length)
  const categoryLength = $derived(
    Math.max(0, (horizontal ? plotHeight : plotWidth) - gapWidth),
  )
  // Reserve group gaps before placing the equal-width bands.
  const categoryScale = $derived(
    scaleBand(
      (stacked ? nonemptyGroups : bars).map((_, index) => index),
      [0, categoryLength],
    )
      .paddingInner(
        categoryCount > 1
          ? Math.min(
              1,
              (barGap * categoryCount) / (categoryLength + barGap || 1),
            )
          : 0,
      )
      .paddingOuter(0),
  )
  const band = $derived(categoryScale.bandwidth())
  const plottedGroups = $derived.by(() => {
    let index = 0
    return nonemptyGroups.map((group, groupIndex) => {
      let positive = 0
      let negative = 0
      const plottedBars = group.bars.map((bar) => {
        const offset = stacked
          ? (categoryScale(groupIndex) ?? 0)
          : (categoryScale(index++) ?? 0) + groupIndex * groupGap
        const start = stacked ? (bar.value < 0 ? negative : positive) : 0
        if (bar.value < 0) negative += bar.value
        else positive += bar.value
        return {
          ...bar,
          offset,
          start: valueScale(start),
          end: valueScale(start + bar.value),
        }
      })
      const center =
        (plottedBars[0]?.offset ?? 0) +
        (stacked ? 0 : ((plottedBars.length - 1) * categoryScale.step()) / 2) +
        band / 2
      return {
        label: group.label,
        center,
        bars: plottedBars,
        positive,
        negative,
      }
    })
  })
  const description = $derived(
    [
      ...nonemptyGroups.map((group) =>
        [
          group.label,
          ...group.bars.map((bar) =>
            [bar.label, bar.series, formatValue(bar.value)]
              .filter(Boolean)
              .join(' '),
          ),
        ]
          .filter(Boolean)
          .join('，'),
      ),
      ...annotations.map(
        (annotation) => `${annotation.label} ${formatValue(annotation.value)}`,
      ),
    ].join('。'),
  )

  function seriesColor(name: string) {
    return Object.hasOwn(colors, name)
      ? colors[name]
      : 'var(--bar-chart-color, currentColor)'
  }

  function estimatedLabelWidth(
    labels: readonly string[],
    fontSize = themeFontSize,
  ) {
    return Math.max(
      0,
      ...labels.map((label) => {
        if (measureContext) {
          measureContext.font = `${fontSize}px ${fontFamily}`
          return Math.ceil(measureContext.measureText(label).width)
        }
        const wideCharacters = label.match(/[^\x00-\x7f]/g)?.length ?? 0
        const narrowCharacters = label.length - wideCharacters
        return Math.ceil(
          ((narrowCharacters * estimatedCharacterWidth +
            wideCharacters * estimatedWideCharacterWidth) *
            fontSize) /
            14,
        )
      }),
    )
  }

  function axisLine(position: number) {
    return horizontal
      ? { x1: position, x2: position, y2: plotHeight }
      : { y1: position, y2: position, x2: plotWidth }
  }

  function showTooltip(
    event: PointerEvent,
    bar: BarChartBar,
    group: { label?: string; bars: readonly BarChartBar[] },
  ) {
    if (event.pointerType === 'touch') return
    const labels = group.label || bar.label || bar.series
    const rows = group.label
      ? group.bars.filter((item) => item.value !== 0)
      : [bar]
    hovered = { x: event.clientX, y: event.clientY, labels, bar, rows }
  }

  function hideTooltip() {
    hovered = undefined
  }

  function isDimmed(bar: BarChartBar) {
    return hoveredSeries !== undefined
      ? bar.series !== hoveredSeries
      : hovered !== undefined && hovered.bar !== bar
  }
</script>

<svelte:window onscrollcapture={hideTooltip} onresize={hideTooltip} />

{#if bars.length}
  <div class="chart" class:plain={!chartBackdrop} bind:this={chartElement}>
    {#if showLegend}
      <Legend
        items={series.map((name) => ({
          label: name,
          color: seriesColor(name),
        }))}
        active={hoveredSeries ?? hovered?.bar.series}
        onhover={(name) => {
          hoveredSeries = name
        }}
      />
    {/if}
    {#if axisLabel && !horizontal}
      <p class="axis-label">{axisLabel}</p>
    {/if}
    <div
      class="plot"
      bind:clientWidth={width}
      bind:clientHeight={containerHeight}
    >
      {#if width}
        <svg
          viewBox="0 0 {width} {height}"
          role="img"
          aria-label={label}
          aria-describedby={descriptionId}
        >
          <desc id={descriptionId}>{description}</desc>
          <g transform="translate({leftGutter}, {topGutter})">
            {#each horizontal && !showXAxis ? [] : ticks as tick (tick)}
              {@const position = valueScale(tick)}
              <line class="grid" {...axisLine(position)} />
              <text
                class="tick"
                style:font-size={horizontal
                  ? xAxisFontSize
                    ? `${xAxisFontSize}px`
                    : undefined
                  : yAxisFontSize
                    ? `${yAxisFontSize}px`
                    : undefined}
                x={horizontal ? position : -8}
                y={horizontal
                  ? plotHeight + Math.max(18, xAxisFontSize ?? 14)
                  : position}
                text-anchor={horizontal ? 'middle' : 'end'}
                dominant-baseline={horizontal ? undefined : 'middle'}
                >{formatValue(tick)}</text
              >
            {/each}
            {#each plottedGroups as group, groupIndex}
              {#if stacked}
                <defs>
                  <clipPath id="{descriptionId}-stack-{groupIndex}">
                    <rect
                      x={horizontal
                        ? valueScale(group.negative)
                        : group.center - band / 2}
                      y={horizontal
                        ? group.center - band / 2
                        : valueScale(group.positive)}
                      width={horizontal
                        ? valueScale(group.positive) -
                          valueScale(group.negative)
                        : band}
                      height={horizontal
                        ? band
                        : valueScale(group.negative) -
                          valueScale(group.positive)}
                      rx="2"
                    />
                  </clipPath>
                </defs>
              {/if}
              {#each group.bars as bar, barIndex}
                {@const start = Math.min(bar.start, bar.end)}
                {@const length = Math.abs(bar.end - bar.start)}
                {@const before =
                  stacked &&
                  group.bars
                    .slice(0, barIndex)
                    .some((other) => other.value * bar.value > 0)
                    ? 0.5
                    : 0}
                {@const after =
                  stacked &&
                  group.bars
                    .slice(barIndex + 1)
                    .some((other) => other.value * bar.value > 0)
                    ? 0.5
                    : 0}
                {@const inset = horizontal === bar.value >= 0 ? before : after}
                {@const visibleLength = Math.max(0, length - before - after)}
                {@const center = bar.offset + band / 2}
                <g
                  role="group"
                  onpointerenter={(event) => showTooltip(event, bar, group)}
                  onpointermove={(event) => showTooltip(event, bar, group)}
                  onpointerleave={hideTooltip}
                  onpointercancel={hideTooltip}
                >
                  <rect
                    x={horizontal ? start + inset : bar.offset}
                    y={horizontal ? bar.offset : start + inset}
                    width={horizontal ? visibleLength : band}
                    height={horizontal ? band : visibleLength}
                    fill={seriesColor(bar.series)}
                    opacity={isDimmed(bar) ? 0.5 : 1}
                    clip-path={stacked
                      ? `url(#${descriptionId}-stack-${groupIndex})`
                      : undefined}
                    rx={stacked ? undefined : 2}
                  />
                  {#each labelsFor(bar) as valueLabel}
                    {@const position = valueLabel.position}
                    {#if showValues && bar.value !== 0 && valueLabel.text && (position === 'outside' || ((horizontal ? visibleLength : band) > estimatedLabelWidth( [valueLabel.text], ) + 8 && (horizontal ? band : visibleLength) > 16))}
                      <text
                        class="value"
                        opacity={isDimmed(bar) ? 0.15 : 1}
                        x={horizontal
                          ? position === 'outside'
                            ? bar.end + (bar.value < 0 ? -6 : 6)
                            : position === 'left'
                              ? start + inset + 8
                              : (bar.start + bar.end) / 2
                          : position === 'left'
                            ? bar.offset + 4
                            : center}
                        y={horizontal
                          ? center
                          : position === 'outside'
                            ? bar.end + (bar.value < 0 ? 16 : -6)
                            : (bar.start + bar.end) / 2}
                        text-anchor={position === 'left'
                          ? 'start'
                          : horizontal && position === 'outside'
                            ? bar.value < 0
                              ? 'end'
                              : 'start'
                            : 'middle'}
                        dominant-baseline={!horizontal && position === 'outside'
                          ? undefined
                          : 'middle'}>{valueLabel.text}</text
                      >
                    {/if}
                  {/each}
                  {#if !stacked && horizontal}
                    {#if bar.label}
                      <text
                        class="category"
                        style:font-size={yAxisFontSize
                          ? `${yAxisFontSize}px`
                          : undefined}
                        x={-8 - negativeValueGutter}
                        y={center}
                        text-anchor="end"
                        dominant-baseline="middle">{bar.label}</text
                      >
                    {/if}
                  {:else if !stacked}
                    {#if bar.label && showXAxis}
                      <text
                        class="category bar-label"
                        style:font-size={xAxisFontSize
                          ? `${xAxisFontSize}px`
                          : undefined}
                        x={center}
                        y={categoryLabelY}
                        text-anchor="middle">{bar.label}</text
                      >
                    {/if}
                  {/if}
                </g>
              {/each}
              {#if stacked && showTotals && group.negative === 0}
                <text
                  class="value"
                  x={horizontal ? valueScale(group.positive) + 6 : group.center}
                  y={horizontal ? group.center : valueScale(group.positive) - 6}
                  text-anchor={horizontal ? 'start' : 'middle'}
                  dominant-baseline={horizontal ? 'middle' : undefined}
                  >{formatValue(group.positive)}</text
                >
              {/if}
              {#if group.label && (horizontal || showXAxis)}
                {#if horizontal}
                  <text
                    class="category"
                    style:font-size={yAxisFontSize
                      ? `${yAxisFontSize}px`
                      : undefined}
                    x={-8 - barLabelGutter - negativeValueGutter}
                    y={group.center}
                    text-anchor="end"
                    dominant-baseline="middle">{group.label}</text
                  >
                {:else}
                  <text
                    class="category"
                    style:font-size={xAxisFontSize
                      ? `${xAxisFontSize}px`
                      : undefined}
                    x={group.center}
                    y={categoryLabelY +
                      (hasBarLabels
                        ? Math.max(20, (xAxisFontSize ?? 14) + 6)
                        : 0)}
                    text-anchor="middle">{group.label}</text
                  >
                {/if}
              {/if}
            {/each}
            {#if !horizontal || showXAxis}<line
                class="baseline"
                {...axisLine(baseline)}
              />{/if}
            {#each annotations as annotation, index}
              {@const position = valueScale(annotation.value)}
              {#if horizontal}
                {@const lane =
                  index * annotationStep + themeFontSize - topGutter}
                {@const alignEnd = position > plotWidth / 2}
                <line
                  class="annotation"
                  x1={position}
                  x2={position}
                  y1={lane}
                  y2={plotHeight}
                />
                <circle
                  class="annotation-point"
                  cx={position}
                  cy={lane}
                  r="2"
                />
                <text
                  class="annotation-label"
                  x={position + (alignEnd ? -8 : 8)}
                  y={lane}
                  text-anchor={alignEnd ? 'end' : 'start'}
                  dominant-baseline="middle">{annotation.label}</text
                >
              {:else}
                <line class="annotation" {...axisLine(position)} />
                <text
                  class="annotation-label"
                  x={plotWidth - 2}
                  y={position - 6}
                  text-anchor="end">{annotation.label}</text
                >
              {/if}
            {/each}
          </g>
        </svg>
      {/if}
    </div>
    {#if hovered}
      <TooltipOverlay x={hovered.x} y={hovered.y} title={hovered.labels}>
        <div class="tooltip-rows">
          {#each hovered.rows as item}
            <div class="tooltip-row">
              <span
                class="tooltip-swatch"
                style:background={seriesColor(item.series)}
              ></span>
              <span
                >{[item.label, item.series].filter(Boolean).join(' · ')}</span
              >
              <span class="tooltip-value">{formatValue(item.value)}</span>
            </div>
          {/each}
        </div>
      </TooltipOverlay>
    {/if}
    {#if axisLabel && horizontal && showXAxis}
      <p class="axis-label bottom">{axisLabel}</p>
    {/if}
  </div>
{/if}

<style>
  .tooltip-rows {
    display: grid;
    gap: 2px;
  }
  .tooltip-row {
    display: grid;
    grid-template-columns: 1em minmax(0, 1fr) auto;
    align-items: center;
    gap: 8px;
  }
  .tooltip-swatch {
    width: 1em;
    height: 1em;
    border-radius: 2px;
  }
  .tooltip-value {
    padding-left: 10px;
    border-left: 1px solid var(--neutral-gray-200, #ddd);
    text-align: right;
    font-variant-numeric: tabular-nums;
  }
  .chart {
    display: flex;
    flex-direction: column;
    height: var(--bar-chart-height, 100%);
    min-height: 0;
    box-sizing: border-box;
    min-width: 0;
    padding: 12px 8px 8px;
    background: var(--neutral-gray-50);
    color: var(--text-color);
    font-size: var(--text-xs);
    gap: 7px;
  }
  .chart.plain {
    padding: 0;
    background: transparent;
  }
  .axis-label {
    margin: 0 0 0 4px;
    color: var(--neutral-gray-700);
  }
  .axis-label.bottom {
    margin: 0;
    text-align: center;
  }
  .plot {
    position: relative;
    flex: 1 1 auto;
    width: 100%;
    min-height: 0;
    aspect-ratio: var(--bar-chart-aspect-ratio, 4 / 3);
  }
  svg {
    position: absolute;
    inset: 0;
    display: block;
    width: 100%;
    height: 100%;
  }
  text {
    fill: currentColor;
  }
  rect,
  .value {
    transition: opacity 150ms ease;
  }
  @media (prefers-reduced-motion: reduce) {
    rect,
    .value {
      transition: none;
    }
  }
  .grid {
    stroke: var(--neutral-gray-300);
  }
  .baseline {
    stroke: var(--neutral-gray-500);
  }
  .baseline,
  .annotation,
  .annotation-label {
    pointer-events: none;
  }
  .tick,
  .category {
    fill: var(--neutral-gray-700);
  }
  .bar-label {
    font-size: 0.9em;
  }
  .value {
    font-weight: 400;
  }
  .annotation {
    stroke: var(--neutral-gray-600);
    stroke-dasharray: 3 3;
  }
  .annotation-point {
    fill: var(--neutral-gray-600);
  }
  .annotation-label {
    paint-order: stroke;
    stroke: var(--neutral-gray-50);
    stroke-width: 3px;
    stroke-linejoin: round;
    color: var(--neutral-gray-600);
  }
</style>
