<script lang="ts">
  import { scaleBand, scaleLinear } from 'd3-scale'
  import { lab } from 'd3-color'
  import { onMount } from 'svelte'
  import { formatNumber } from '../../utils/format.ts'
  import TooltipOverlay from './TooltipOverlay.svelte'
  import TooltipRows from './TooltipRows.svelte'
  import Legend from './Legend.svelte'
  import type { BarChartBar, BarChartProps } from './types.ts'

  const descriptionId = $props.id()
  function contrastText(node: SVGTextElement, color: string | undefined) {
    let frame = 0
    function update(color: string | undefined) {
      cancelAnimationFrame(frame)
      node.style.removeProperty('fill')
      if (color === undefined) return
      frame = requestAnimationFrame(() => {
        node.style.fill =
          lab(getComputedStyle(node).stroke).l < 55
            ? 'var(--neutral-white, #fff)'
            : 'var(--text-color, #333)'
      })
    }
    update(color)
    return { update, destroy: () => cancelAnimationFrame(frame) }
  }
  const annotationStep = 32
  const axisLabelOffset = 8
  const categoryBaselineOffset = 0.32
  const estimatedCharacterWidth = 8.5
  const estimatedWideCharacterWidth = 14

  const {
    label,
    groups: inputGroups,
    sortOrder = 'original',
    sortBy,
    orientation = 'vertical',
    mode = 'grouped',
    chartBackdrop = true,
    barGap = 4,
    groupGap = 10,
    showXAxis = true,
    hoverFocusXAxis = true,
    hoverFocusYAxis = true,
    showXGrid = true,
    xAxisPosition = 'bottom',
    valueTicks,
    showValues = true,
    valueSeries = [],
    valueTopN,
    showTooltip = true,
    showTotals = true,
    valuePosition,
    xAxisFontSize,
    yAxisFontSize,
    mobileXTickCount,
    mobileYTickCount,
    colors = {},
    showLegend = true,
    annotations = [],
    axisLabel,
    valueSuffix = '',
    formatValue = (value) =>
      mode === 'stacked-percent'
        ? `${Number(value.toFixed(1))}%`
        : formatNumber(value) + valueSuffix,
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
  const sourceGroups = $derived.by(() => {
    if (sortOrder === 'original') return inputGroups
    const total = (group: (typeof inputGroups)[number]) => {
      const value = group.bars.reduce(
        (sum, bar) => sum + (!sortBy || bar.series === sortBy ? bar.value : 0),
        0,
      )
      if (mode !== 'stacked-percent') return value
      const sum = group.bars.reduce((sum, bar) => sum + Math.abs(bar.value), 0)
      return sum ? value / sum : 0
    }
    return [...inputGroups].sort(
      (a, b) => (total(a) - total(b)) * (sortOrder === 'ascending' ? 1 : -1),
    )
  })
  const stacked = $derived(mode !== 'grouped')
  const groups = $derived(
    mode === 'stacked-percent'
      ? sourceGroups.map((group) => {
          const total = group.bars.reduce(
            (sum, bar) => sum + Math.abs(bar.value),
            0,
          )
          return {
            ...group,
            bars: group.bars.map((bar) => ({
              ...bar,
              value: total ? (bar.value / total) * 100 : 0,
            })),
          }
        })
      : sourceGroups,
  )
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
    (stacked ? 0 : groupGap * Math.max(0, nonemptyGroups.length - 1)) +
      nonemptyGroups
        .slice(0, -1)
        .reduce((sum, group) => sum + (group.gapAfter ?? 0), 0),
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
    scaleLinear(
      mode === 'stacked-percent'
        ? [minValue < 0 ? -100 : 0, maxValue > 0 || minValue === 0 ? 100 : 0]
        : [minValue, minValue === maxValue ? 1 : maxValue],
      [0, 1],
    ).nice(6),
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
        ) + axisLabelOffset
      : 0,
  )
  const barLabelGutter = $derived(
    horizontal && hasBarLabels
      ? estimatedLabelWidth(barLabels, yAxisFontSize) + axisLabelOffset
      : 0,
  )
  const groupLabelGutter = $derived(
    horizontal && hasGroupLabels
      ? estimatedLabelWidth(
          nonemptyGroups.flatMap((group) => (group.label ?? '').split('\n')),
          yAxisFontSize,
        ) + axisLabelOffset
      : 0,
  )
  const leftGutter = $derived(
    horizontal
      ? groupLabelGutter + barLabelGutter + negativeValueGutter
      : estimatedLabelWidth(
          valueTicks?.map((tick) => tick.label) ??
            valueDomainScale.ticks(6).map((tick) => formatValue(tick)),
          yAxisFontSize,
        ) + axisLabelOffset,
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
        ]) + axisLabelOffset
      : 0,
  )
  const categoryEdgeGutter = $derived(
    horizontal && (hasGroupLabels || hasBarLabels || showValues)
      ? Math.ceil(
          Math.max(yAxisFontSize ?? themeFontSize, themeFontSize) * 0.6,
        ) + 2
      : 0,
  )
  const topGutter = $derived(
    horizontal
      ? categoryEdgeGutter +
          annotations.filter((annotation) => annotation.label).length *
            annotationStep +
          (showXAxis && xAxisPosition === 'top'
            ? Math.max(22, (xAxisFontSize ?? themeFontSize) + 8)
            : 0)
      : 24,
  )
  const plotWidth = $derived(Math.max(0, width - leftGutter - rightGutter))
  const plotHeight = $derived(
    Math.max(
      0,
      containerHeight -
        topGutter -
        categoryEdgeGutter -
        (showXAxis
          ? horizontal
            ? xAxisPosition === 'top'
              ? 0
              : Math.max(22, (xAxisFontSize ?? themeFontSize) + 8)
            : Math.max(52, (xAxisFontSize ?? 14) * 2 + 24)
          : 0),
    ),
  )
  const categoryLabelY = $derived(
    plotHeight + Math.max(minValue < 0 ? 38 : 18, (xAxisFontSize ?? 14) + 4),
  )
  const height = $derived(containerHeight)
  const mobile = $derived(width > 0 && width <= 580)
  const tickCount = $derived(
    (mobile ? (horizontal ? mobileXTickCount : mobileYTickCount) : undefined) ??
      (horizontal && plotWidth < 260 ? 3 : 6),
  )
  function categoryTickVisible(index: number, total: number) {
    const count = mobile
      ? horizontal
        ? mobileYTickCount
        : mobileXTickCount
      : undefined
    return (
      count === undefined ||
      index % Math.max(1, Math.ceil((total - 1) / Math.max(1, count - 1))) ===
        0 ||
      index === total - 1
    )
  }
  const valueScale = $derived(
    valueDomainScale
      .copy()
      .range(horizontal ? [0, plotWidth] : [plotHeight, 0]),
  )
  const ticks = $derived(
    valueTicks?.map((tick) => tick.value) ?? valueScale.ticks(tickCount),
  )
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
    let extraGap = 0
    return nonemptyGroups.map((group, groupIndex) => {
      let positive = 0
      let negative = 0
      const plottedBars = group.bars.map((bar) => {
        const offset = stacked
          ? (categoryScale(groupIndex) ?? 0) + extraGap
          : (categoryScale(index++) ?? 0) + groupIndex * groupGap + extraGap
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
      extraGap += group.gapAfter ?? 0
      return {
        label: group.label,
        emphasized: group.emphasized,
        separatorAfter: group.separatorAfter,
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
          measureContext.font = `700 ${fontSize}px ${fontFamily}`
          // Leave room for glyph edges beyond the measured advance width.
          return Math.ceil(measureContext.measureText(label).width) + 4
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

  function hoverBar(
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
  function focusedTick(tick: number) {
    if (!hovered) return false
    if (valueTicks) {
      return hovered.bar.axisValue === tick
    }
    return (
      ticks.reduce(
        (closest, candidate) =>
          Math.abs(candidate - hovered!.bar.value) <
          Math.abs(closest - hovered!.bar.value)
            ? candidate
            : closest,
        ticks[0],
      ) === tick
    )
  }

  function isDimmed(bar: BarChartBar) {
    return hoveredSeries !== undefined
      ? bar.series !== hoveredSeries
      : hovered !== undefined && hovered.bar !== bar
  }
</script>

<svelte:window onscrollcapture={hideTooltip} onresize={hideTooltip} />

{#if bars.length}
  <div
    class="chart"
    class:plain={!chartBackdrop}
    class:axis-hovered={hovered !== undefined}
    bind:this={chartElement}
  >
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
              {#if !horizontal || showXGrid}<line
                  class="grid"
                  {...axisLine(position)}
                />{/if}
              <text
                class="tick"
                class:axis-focus-disabled={!(horizontal
                  ? hoverFocusXAxis
                  : hoverFocusYAxis)}
                class:axis-focused={focusedTick(tick)}
                style:font-size={horizontal
                  ? xAxisFontSize
                    ? `${xAxisFontSize}px`
                    : undefined
                  : yAxisFontSize
                    ? `${yAxisFontSize}px`
                    : undefined}
                x={horizontal ? position : -axisLabelOffset}
                y={horizontal
                  ? xAxisPosition === 'top'
                    ? -8
                    : plotHeight + Math.max(18, xAxisFontSize ?? 14)
                  : position}
                text-anchor={horizontal ? 'middle' : 'end'}
                dominant-baseline={horizontal ? undefined : 'middle'}
                >{valueTicks?.find((item) => item.value === tick)?.label ??
                  formatValue(tick)}</text
              >
            {/each}
            {#each plottedGroups as group, groupIndex}
              {#if group.separatorAfter && plottedGroups[groupIndex + 1]}
                {@const separator =
                  ((group.bars.at(-1)?.offset ?? 0) +
                    band +
                    (plottedGroups[groupIndex + 1].bars[0]?.offset ?? 0)) /
                  2}
                <line
                  class="group-separator"
                  x1={horizontal ? -leftGutter : separator}
                  x2={horizontal ? plotWidth : separator}
                  y1={horizontal ? separator : 0}
                  y2={horizontal ? separator : plotHeight}
                />
              {/if}
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
                  onpointerenter={(event) => hoverBar(event, bar, group)}
                  onpointermove={(event) => hoverBar(event, bar, group)}
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
                  {#if !stacked && horizontal}
                    {#if bar.label && categoryTickVisible(groupIndex, plottedGroups.length) && categoryTickVisible(barIndex, group.bars.length)}
                      <text
                        class="category"
                        class:axis-focus-disabled={!(horizontal
                          ? hoverFocusYAxis
                          : hoverFocusXAxis)}
                        class:axis-focused={hovered?.bar === bar}
                        style:font-size={yAxisFontSize
                          ? `${yAxisFontSize}px`
                          : undefined}
                        x={-axisLabelOffset - negativeValueGutter}
                        y={center}
                        dy={`${categoryBaselineOffset}em`}
                        text-anchor="end">{bar.label}</text
                      >
                    {/if}
                  {:else if !stacked}
                    {#if bar.label && showXAxis && categoryTickVisible(groupIndex, plottedGroups.length) && categoryTickVisible(barIndex, group.bars.length)}
                      <text
                        class="category bar-label"
                        class:axis-focus-disabled={!hoverFocusXAxis}
                        class:axis-focused={hovered?.bar === bar}
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
              {#if group.label && (horizontal || showXAxis) && categoryTickVisible(groupIndex, plottedGroups.length)}
                {#if horizontal}
                  <text
                    class="category"
                    class:emphasized={group.emphasized}
                    class:axis-focus-disabled={!(horizontal
                      ? hoverFocusYAxis
                      : hoverFocusXAxis)}
                    class:axis-focused={hovered?.labels === group.label}
                    style:font-size={yAxisFontSize
                      ? `${yAxisFontSize}px`
                      : undefined}
                    x={-axisLabelOffset - barLabelGutter - negativeValueGutter}
                    y={group.center}
                    text-anchor="end"
                  >
                    {#each group.label.split('\n') as line, index}
                      <tspan
                        x={-axisLabelOffset -
                          barLabelGutter -
                          negativeValueGutter}
                        dy={index === 0
                          ? `${categoryBaselineOffset - ((group.label.split('\n').length - 1) * 1.2) / 2}em`
                          : '1.2em'}>{line}</tspan
                      >
                    {/each}
                  </text>
                {:else}
                  <text
                    class="category"
                    class:axis-focus-disabled={!(horizontal
                      ? hoverFocusYAxis
                      : hoverFocusXAxis)}
                    class:axis-focused={hovered?.labels === group.label}
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
                {@const lane = annotation.label
                  ? annotations.slice(0, index).filter((item) => item.label)
                      .length *
                      annotationStep +
                    themeFontSize -
                    topGutter
                  : 0}
                {@const alignEnd = position > plotWidth / 2}
                <line
                  class="annotation"
                  x1={position}
                  x2={position}
                  y1={lane}
                  y2={plotHeight}
                />
                {#if annotation.label}<circle
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
                  >{/if}
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
            <g class="value-layer" pointer-events="none">
              {#each plottedGroups as group}
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
                  {@const inset =
                    horizontal === bar.value >= 0 ? before : after}
                  {@const visibleLength = Math.max(0, length - before - after)}
                  {@const center = bar.offset + band / 2}
                  {#each labelsFor(bar) as valueLabel}
                    {@const position = valueLabel.position}
                    {#if showValues && ((valueTopN !== undefined ? [...group.bars]
                            .sort((a, b) => b.value - a.value)
                            .slice(0, valueTopN)
                            .includes(bar) : !valueSeries.length || valueSeries.includes(bar.series)) || hovered?.bar === bar || hoveredSeries === bar.series) && bar.value !== 0 && valueLabel.text && (position === 'outside' || ((horizontal ? visibleLength : band) > estimatedLabelWidth( [valueLabel.text], ) + 8 && (horizontal ? band : visibleLength) > 16))}
                      <text
                        class="value"
                        style:stroke-opacity={isDimmed(bar) ? 0 : 0.8}
                        style:stroke={position === 'outside'
                          ? undefined
                          : seriesColor(bar.series)}
                        use:contrastText={position === 'outside'
                          ? undefined
                          : seriesColor(bar.series)}
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
                {/each}
              {/each}
            </g>
          </g>
        </svg>
      {/if}
    </div>
    {#if showTooltip && hovered}
      <TooltipOverlay x={hovered.x} y={hovered.y} title={hovered.labels}>
        <TooltipRows
          rows={hovered.rows.map((item) => ({
            label: [item.label, item.series].filter(Boolean).join(' · '),
            value: formatValue(item.value),
            color: seriesColor(item.series),
          }))}
        />
      </TooltipOverlay>
    {/if}
    {#if axisLabel && horizontal && showXAxis}
      <p class="axis-label bottom">{axisLabel}</p>
    {/if}
  </div>
{/if}

<style>
  .group-separator {
    stroke: var(--neutral-gray-300);
    stroke-width: 1px;
    vector-effect: non-scaling-stroke;
    pointer-events: none;
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
    letter-spacing: 0.025em;
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
  .axis-focused:not(.axis-focus-disabled) {
    font-weight: 700;
    fill: var(--text-color);
  }
  .category {
    line-height: 100%;
  }
  .category.emphasized {
    font-weight: 700;
  }
  .tick,
  .category {
    transition: opacity 150ms ease;
  }
  .axis-hovered .tick:not(.axis-focused):not(.axis-focus-disabled),
  .axis-hovered .category:not(.axis-focused):not(.axis-focus-disabled) {
    opacity: 0.25;
  }
  .tick,
  .category {
    fill: var(--neutral-gray-700);
  }
  .bar-label {
    font-size: 0.9em;
  }
  .value {
    paint-order: stroke;
    stroke: var(--neutral-gray-50);
    stroke-width: 4px;
    stroke-opacity: 0.8;
    stroke-linejoin: round;
    font-weight: 400;
  }
  .plain .value {
    stroke: var(--background, var(--neutral-white, #fff));
  }
  .annotation {
    stroke: var(--neutral-gray-800);
    stroke-dasharray: 3 3;
    stroke-width: 2px;
  }
  .annotation-point {
    fill: var(--neutral-gray-800);
  }
  .annotation-label {
    paint-order: stroke;
    stroke: var(--neutral-gray-50);
    stroke-linejoin: round;
    color: var(--neutral-gray-800);
    font-weight: 500;
  }
  @media (max-width: 580px) {
    .container {
      height: 100%;
    }
  }
</style>
