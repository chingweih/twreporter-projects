<script module lang="ts">
  import { clearCache, prepareWithSegments } from '@chenglou/pretext'
  import { createSubscriber } from 'svelte/reactivity'

  const fontFamily = "'Roboto Slab', 'Noto Sans TC', sans-serif"
  const trackFontLoads = createSubscriber((update) => {
    clearCache()
    function onFontLoad() {
      clearCache()
      update()
    }
    document.fonts.addEventListener('loadingdone', onFontLoad)
    return () => document.fonts.removeEventListener('loadingdone', onFontLoad)
  })
</script>

<script lang="ts">
  import { diffArrays } from 'diff'
  import { placeTextSegments } from '../../utils/text-layout.ts'

  let {
    full,
    brief,
    showFull = false,
    fontSize = 16,
    lineHeight = 1.7,
    letterSpacing = 0.05,
  }: {
    full: string
    brief: string
    showFull?: boolean
    fontSize?: number
    lineHeight?: number
    letterSpacing?: number
  } = $props()

  type Position = { x: number; y: number }
  type Segment = {
    text: string
    offset: number
    brief?: Position
    full?: Position
  }
  type DiffIndex = { key: number; offset: number }

  let rect = $state<DOMRectReadOnly>()
  const font = $derived(`${fontSize}px ${fontFamily}`)
  const width = $derived(rect?.width)
  const hasWidth = $derived(Boolean(width))
  const side = $derived(showFull ? 'full' : 'brief')

  $effect(() => {
    trackFontLoads()
    void document.fonts.load(font, brief + full).catch(() => {})
  })

  const prepared = $derived.by(() => {
    if (!hasWidth) return
    trackFontLoads()
    const options = {
      whiteSpace: 'pre-wrap',
      letterSpacing: letterSpacing * fontSize,
    } as const
    return {
      brief: prepareWithSegments(brief, font, options),
      full: prepareWithSegments(full, font, options),
    }
  })
  const diffIndices = $derived.by(() => {
    if (!prepared) return
    const indices: { brief: DiffIndex[]; full: DiffIndex[] } = {
      brief: [],
      full: [],
    }
    let key = 0
    for (const { value, added, removed } of diffArrays(
      prepared.brief.segments,
      prepared.full.segments,
    )) {
      for (let offset = 0; offset < value.length; offset++) {
        const index = { key: key++, offset }
        if (!added) indices.brief.push(index)
        if (!removed) indices.full.push(index)
      }
    }
    return indices
  })
  const placed = $derived(
    prepared && width
      ? {
          brief: placeTextSegments(
            prepared.brief,
            font,
            width,
            lineHeight * fontSize,
          ),
          full: placeTextSegments(
            prepared.full,
            font,
            width,
            lineHeight * fontSize,
          ),
        }
      : undefined,
  )

  const segments = $derived.by(() => {
    if (!placed || !diffIndices) return []
    const segments = new Map<string, Segment>()
    for (const side of ['brief', 'full'] as const) {
      for (const { index, from, text, x, y } of placed[side].segments) {
        const diff = diffIndices[side][index]
        const key = `${diff.key}:${from}:${text}`
        const segment = segments.get(key) ?? { text, offset: diff.offset }
        segment[side] = { x, y }
        segments.set(key, segment)
      }
    }
    return [...segments]
  })
</script>

<div
  class="text-diff"
  style:font-family={fontFamily}
  style:font-size={`${fontSize}px`}
  style:line-height={lineHeight}
  style:letter-spacing={`${letterSpacing}em`}
  style:height={placed ? `${placed[side].height}px` : undefined}
  bind:contentRect={rect}
>
  <span class:sr-only={placed}>{showFull ? full : brief}</span>
  {#each segments as [key, segment] (key)}
    {@const position = segment[side] ?? segment.brief ?? segment.full}
    <span
      class="segment"
      class:changed={!segment.brief || !segment.full}
      class:hidden={!segment[side]}
      style:--i={segment.offset}
      style:transform="translate({position?.x}px, {position?.y}px)"
      aria-hidden="true">{segment.text}</span
    >
  {/each}
</div>

<style>
  .text-diff {
    --ease: cubic-bezier(0.2, 0, 0, 1);
    position: relative;
    font-style: normal;
    font-weight: 400;
    overflow-y: clip;
    overflow-wrap: anywhere;
    white-space: pre-wrap;
    text-align: justify;
    transition: height 0.4s var(--ease);
  }

  .sr-only {
    position: absolute;
    width: 1px;
    height: 1px;
    overflow: hidden;
    clip-path: inset(50%);
    white-space: nowrap;
  }

  .segment {
    position: absolute;
    top: 0;
    left: 0;
    white-space: pre;
    transition:
      transform 0.4s var(--ease),
      opacity 0.25s ease-out,
      visibility 0.25s;
  }

  .segment.changed {
    --delay: calc(0.1s + min(var(--i) * 8ms, 0.2s));
    transition-delay: 0s, var(--delay), var(--delay);
  }

  .segment.hidden {
    opacity: 0;
    visibility: hidden;
    transition-duration: 0.4s, 0.15s, 0.15s;
    transition-delay: 0s;
  }

  @media (prefers-reduced-motion: reduce) {
    .text-diff,
    .segment {
      transition: none;
    }
  }
</style>
