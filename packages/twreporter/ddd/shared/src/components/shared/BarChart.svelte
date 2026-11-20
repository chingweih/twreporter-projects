<script lang="ts">
  import { scaleBand, scaleLinear } from 'd3-scale'
  import { formatNumber } from '../../utils/format.ts'
  import ScrollFade from './ScrollFade.svelte'
  import TooltipOverlay from './TooltipOverlay.svelte'
  import type { BarChartBar, BarChartProps } from './types.ts'

  const descriptionId = $props.id()
  const groupGap = 10
  const annotationStep = 24
  const horizontalBarStep = 42
  const minimumHorizontalPlotWidth = 154
  const labelGap = 10
  const estimatedCharacterWidth = 8.5
  const estimatedWideCharacterWidth = 14
  const estimatedVerticalCategoryCharacterWidth = 6.5

  const {
    label,
    groups,
    orientation = 'vertical',
    colors = {},
    showLegend = true,
    annotations = [],
    axisLabel,
    valueSuffix = '',
    formatValue = (value) => formatNumber(value) + valueSuffix,
  }: BarChartProps = $props()

  let width = $state(0)
  let hovered = $state<{
    x: number
    y: number
    labels: string
    bar: BarChartBar
  }>()
  const horizontal = $derived(orientation === 'horizontal')
  const nonemptyGroups = $derived(groups.filter((group) => group.bars.length))
  const bars = $derived(nonemptyGroups.flatMap((group) => group.bars))
  const series = $derived([...new Set(bars.map((bar) => bar.series))])
  const hasGroupLabels = $derived(nonemptyGroups.some((group) => group.label))
  const barLabels = $derived(bars.map((bar) => bar.label ?? ''))
  const hasBarLabels = $derived(barLabels.some(Boolean))
  const gapWidth = $derived(groupGap * Math.max(0, nonemptyGroups.length - 1))
  const values = $derived([
    ...bars.map((bar) => bar.value),
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
    horizontal && minValue < 0
      ? estimatedLabelWidth(
          values
            .filter((value) => value < 0)
            .map((value) => formatValue(value)),
        ) + labelGap
      : 0,
  )
  const barLabelGutter = $derived(
    horizontal && hasBarLabels
      ? Math.max(66, estimatedLabelWidth(barLabels) + labelGap)
      : 0,
  )
  const groupLabelGutter = $derived(
    horizontal && hasGroupLabels
      ? Math.max(
          102,
          estimatedLabelWidth(
            nonemptyGroups.map((group) => group.label ?? ''),
          ) + labelGap,
        )
      : 0,
  )
  const leftGutter = $derived(
    horizontal
      ? 10 + groupLabelGutter + barLabelGutter + negativeValueGutter
      : Math.max(
          38,
          estimatedLabelWidth(
            valueDomainScale.ticks(6).map((tick) => formatValue(tick)),
          ) + labelGap,
        ),
  )
  const rightGutter = $derived(
    horizontal
      ? Math.max(
          48,
          estimatedLabelWidth(
            values
              .filter((value) => value >= 0)
              .map((value) => formatValue(value)),
          ) + labelGap,
        )
      : 10,
  )
  const topGutter = $derived(
    horizontal ? 12 + annotations.length * annotationStep : 24,
  )
  const verticalBarStep = $derived(
    Math.max(
      26,
      estimatedLabelWidth(bars.map((bar) => formatValue(bar.value))),
      estimatedLabelWidth(barLabels, estimatedVerticalCategoryCharacterWidth),
    ),
  )
  const minWidth = $derived(
    leftGutter +
      rightGutter +
      (horizontal
        ? minimumHorizontalPlotWidth
        : bars.length * verticalBarStep + gapWidth),
  )
  const plotWidth = $derived(Math.max(0, width - leftGutter - rightGutter))
  const plotHeight = $derived(
    horizontal
      ? bars.length * horizontalBarStep + gapWidth
      : Math.min(360, Math.max(216, Math.round(width * 0.52))),
  )
  const categoryLabelY = $derived(plotHeight + (minValue < 0 ? 38 : 18))
  const height = $derived(
    topGutter +
      (horizontal
        ? plotHeight + 26
        : categoryLabelY + 14 + (hasBarLabels && hasGroupLabels ? 20 : 0)),
  )
  const tickCount = $derived(horizontal && plotWidth < 260 ? 3 : 6)
  const valueScale = $derived(
    valueDomainScale
      .copy()
      .range(horizontal ? [0, plotWidth] : [plotHeight, 0]),
  )
  const ticks = $derived(valueScale.ticks(tickCount))
  const baseline = $derived(valueScale(0))
  // Reserve group gaps before placing the equal-width bands.
  const categoryScale = $derived(
    scaleBand(
      bars.map((_, index) => index),
      [0, Math.max(0, (horizontal ? plotHeight : plotWidth) - gapWidth)],
    ).padding(0.2),
  )
  const band = $derived(categoryScale.bandwidth())
  const plottedGroups = $derived.by(() => {
    let index = 0
    return nonemptyGroups.map((group, groupIndex) => {
      const plottedBars = group.bars.map((bar) => {
        const offset = (categoryScale(index++) ?? 0) + groupIndex * groupGap
        return { ...bar, offset, end: valueScale(bar.value) }
      })
      const center =
        (plottedBars[0]?.offset ?? 0) +
        ((plottedBars.length - 1) * categoryScale.step()) / 2 +
        band / 2
      return { label: group.label, center, bars: plottedBars }
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
    characterWidth = estimatedCharacterWidth,
  ) {
    return Math.max(
      0,
      ...labels.map((label) => {
        const wideCharacters = label.match(/[^\x00-\x7f]/g)?.length ?? 0
        const narrowCharacters = label.length - wideCharacters
        return Math.ceil(
          narrowCharacters * characterWidth +
            wideCharacters * estimatedWideCharacterWidth,
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
    groupLabel?: string,
  ) {
    if (event.pointerType === 'touch') return
    const labels = [...new Set([groupLabel, bar.label, bar.series])]
      .filter(Boolean)
      .join(' · ')
    hovered = { x: event.clientX, y: event.clientY, labels, bar }
  }

  function hideTooltip() {
    hovered = undefined
  }
</script>

<svelte:window onscrollcapture={hideTooltip} onresize={hideTooltip} />

{#if bars.length}
  <div class="chart">
    {#if showLegend}
      <ul class="legend" aria-label="圖例">
        {#each series as name (name)}
          <li>
            <span style:background-color={seriesColor(name)}></span>
            {name}
          </li>
        {/each}
      </ul>
    {/if}
    {#if axisLabel && !horizontal}
      <p class="axis-label">{axisLabel}</p>
    {/if}
    <ScrollFade {label}>
      <div bind:clientWidth={width} style:min-width="{minWidth}px">
        {#if width}
          <svg
            viewBox="0 0 {width} {height}"
            role="img"
            aria-label={label}
            aria-describedby={descriptionId}
          >
            <desc id={descriptionId}>{description}</desc>
            <g transform="translate({leftGutter}, {topGutter})">
              {#each ticks as tick (tick)}
                {@const position = valueScale(tick)}
                <line class="grid" {...axisLine(position)} />
                <text
                  class="tick"
                  x={horizontal ? position : -8}
                  y={horizontal ? plotHeight + 18 : position}
                  text-anchor={horizontal ? 'middle' : 'end'}
                  dominant-baseline={horizontal ? undefined : 'middle'}
                  >{formatValue(tick)}</text
                >
              {/each}
              {#each plottedGroups as group}
                {#each group.bars as bar}
                  {@const start = Math.min(baseline, bar.end)}
                  {@const length = Math.abs(bar.end - baseline)}
                  {@const center = bar.offset + band / 2}
                  <g
                    role="group"
                    onpointerenter={(event) =>
                      showTooltip(event, bar, group.label)}
                    onpointermove={(event) =>
                      showTooltip(event, bar, group.label)}
                    onpointerleave={hideTooltip}
                    onpointercancel={hideTooltip}
                  >
                    <rect
                      x={horizontal ? start : bar.offset}
                      y={horizontal ? bar.offset : start}
                      width={horizontal ? length : band}
                      height={horizontal ? band : length}
                      fill={seriesColor(bar.series)}
                    />
                    {#if horizontal}
                      <text
                        class="value"
                        x={bar.end + (bar.value < 0 ? -6 : 6)}
                        y={center}
                        text-anchor={bar.value < 0 ? 'end' : 'start'}
                        dominant-baseline="middle"
                        >{formatValue(bar.value)}</text
                      >
                      {#if bar.label}
                        <text
                          class="category"
                          x={-8 - negativeValueGutter}
                          y={center}
                          text-anchor="end"
                          dominant-baseline="middle">{bar.label}</text
                        >
                      {/if}
                    {:else}
                      <text
                        class="value"
                        x={center}
                        y={bar.end + (bar.value < 0 ? 16 : -6)}
                        text-anchor="middle">{formatValue(bar.value)}</text
                      >
                      {#if bar.label}
                        <text
                          class="category bar-label"
                          x={center}
                          y={categoryLabelY}
                          text-anchor="middle">{bar.label}</text
                        >
                      {/if}
                    {/if}
                  </g>
                {/each}
                {#if group.label}
                  {#if horizontal}
                    <text
                      class="category"
                      x={-8 - barLabelGutter - negativeValueGutter}
                      y={group.center}
                      text-anchor="end"
                      dominant-baseline="middle">{group.label}</text
                    >
                  {:else}
                    <text
                      class="category"
                      x={group.center}
                      y={categoryLabelY + (hasBarLabels ? 20 : 0)}
                      text-anchor="middle">{group.label}</text
                    >
                  {/if}
                {/if}
              {/each}
              <line class="baseline" {...axisLine(baseline)} />
              {#each annotations as annotation, index}
                {@const position = valueScale(annotation.value)}
                {#if horizontal}
                  {@const lane = (index + 1) * annotationStep - topGutter}
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
                    r="3"
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
    </ScrollFade>
    {#if hovered}
      <TooltipOverlay x={hovered.x} y={hovered.y}>
        <div>{hovered.labels}</div>
        <strong>{formatValue(hovered.bar.value)}</strong>
      </TooltipOverlay>
    {/if}
    {#if axisLabel && horizontal}
      <p class="axis-label bottom">{axisLabel}</p>
    {/if}
  </div>
{/if}

<style>
  .chart {
    min-width: 0;
    padding: 12px 8px 8px;
    background: var(--neutral-gray-50);
    color: var(--text-color);
    font-size: var(--text-xs);
  }
  .legend {
    display: flex;
    flex-wrap: wrap;
    justify-content: center;
    gap: 6px 20px;
    margin: 0 0 10px;
    padding: 0;
    list-style: none;
  }
  .legend li {
    display: flex;
    align-items: center;
    gap: 6px;
  }
  .legend span {
    width: 1em;
    height: 1em;
  }
  .axis-label {
    margin: 0 0 0 4px;
    color: var(--neutral-gray-700);
  }
  .axis-label.bottom {
    margin: 0;
    text-align: center;
  }
  svg {
    display: block;
    width: 100%;
  }
  text {
    fill: currentColor;
  }
  .grid {
    stroke: var(--neutral-gray-200);
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
    font-weight: 700;
  }
  .annotation {
    stroke: var(--neutral-gray-700);
    stroke-dasharray: 3 3;
  }
  .annotation-point {
    fill: var(--neutral-gray-700);
  }
  .annotation-label {
    paint-order: stroke;
    stroke: var(--neutral-gray-50);
    stroke-width: 3px;
    stroke-linejoin: round;
  }
</style>
