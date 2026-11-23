<script module lang="ts">
  import { clearCache, prepareWithSegments } from '@chenglou/pretext'
  import { createSubscriber } from 'svelte/reactivity'

  const fontFamily = "'Roboto Slab', 'Noto Sans TC', sans-serif"
  const resizeSettleMs = 120
  const viewportCallbacks = new WeakMap<Element, (visible: boolean) => void>()
  let viewportObserver: IntersectionObserver | undefined
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
    edgeHints,
    fontSize = 16,
    lineHeight = 1.7,
    letterSpacing = 0.05,
  }: {
    full: string
    brief: string
    showFull?: boolean
    edgeHints?: { start: string; end: string }
    fontSize?: number
    lineHeight?: number
    letterSpacing?: number
  } = $props()

  type Position = { x: number; y: number }
  type Segment = {
    text: string
    offset: number
    hint?: boolean
    brief?: Position
    full?: Position
  }
  type DiffIndex = { key: number; offset: number }

  let nearViewport = $state(false)
  let width = $state<number>()
  let resizing = $state(false)
  const font = $derived(`${fontSize}px ${fontFamily}`)
  const canLayout = $derived(nearViewport && Boolean(width))
  const side = $derived(showFull ? 'full' : 'brief')
  const startHint = $derived(edgeHints?.start ?? '')
  const endHint = $derived(edgeHints?.end ?? '')
  const briefText = $derived(startHint + brief + endHint)

  function observeViewport(node: HTMLElement) {
    const observer = (viewportObserver ??= new IntersectionObserver(
      (entries) => {
        for (const { target, isIntersecting } of entries) {
          viewportCallbacks.get(target)?.(isIntersecting)
        }
      },
      { rootMargin: '500px 0px' },
    ))
    viewportCallbacks.set(node, (visible) => (nearViewport = visible))
    observer.observe(node)
    return () => {
      observer.unobserve(node)
      viewportCallbacks.delete(node)
      nearViewport = false
    }
  }

  function observeWidth(node: HTMLElement) {
    let observedWidth: number | undefined
    let resizeTimer: number | undefined
    const observer = new ResizeObserver(([entry]) => {
      const nextWidth = entry.contentRect.width
      if (nextWidth === observedWidth) return
      observedWidth = nextWidth
      window.clearTimeout(resizeTimer)

      if (!width || !nextWidth || nextWidth === width) {
        width = nextWidth
        resizing = false
        return
      }

      resizing = true
      resizeTimer = window.setTimeout(() => {
        width = nextWidth
        resizing = false
      }, resizeSettleMs)
    })
    observer.observe(node)
    return () => {
      observer.disconnect()
      window.clearTimeout(resizeTimer)
      width = undefined
      resizing = false
    }
  }

  $effect(() => {
    if (!nearViewport) return
    void document.fonts.load(font, briefText + full).catch(() => {})
  })

  const prepared = $derived.by(() => {
    if (!canLayout) return
    trackFontLoads()
    const options = {
      whiteSpace: 'pre-wrap',
      letterSpacing: letterSpacing * fontSize,
    } as const
    return {
      brief: prepareWithSegments(briefText, font, options),
      full: prepareWithSegments(full, font, options),
    }
  })
  const briefHints = $derived.by(() => {
    let offset = 0
    const endStart = startHint.length + brief.length
    return prepared?.brief.segments.map((text) => {
      const start = offset
      offset += text.length
      return (
        (startHint.length > 0 && offset <= startHint.length) ||
        (endHint.length > 0 && start >= endStart)
      )
    })
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

  let animating = $state(false)
  let previousPlacement: typeof placed
  let previousSide: typeof side
  $effect.pre(() => {
    // Animate brief/full changes only after both layouts are in place.
    animating = Boolean(
      placed && placed === previousPlacement && side !== previousSide,
    )
    previousPlacement = placed
    previousSide = side
  })

  const segments = $derived.by(() => {
    if (!placed || !diffIndices) return []
    const segments = new Map<string, Segment>()
    for (const side of ['brief', 'full'] as const) {
      for (const { index, from, text, x, y } of placed[side].segments) {
        const diff = diffIndices[side][index]
        const key = `${diff.key}:${from}:${text}`
        const segment = segments.get(key) ?? { text, offset: diff.offset }
        segment[side] = { x, y }
        if (side === 'brief') segment.hint = briefHints?.[index]
        segments.set(key, segment)
      }
    }
    return [...segments]
  })
</script>

<div
  class="text-diff"
  class:animating
  class:resizing
  style:font-family={fontFamily}
  style:font-size={`${fontSize}px`}
  style:line-height={lineHeight}
  style:letter-spacing={`${letterSpacing}em`}
  style:height={placed && !resizing ? `${placed[side].height}px` : undefined}
  {@attach observeViewport}
  {@attach nearViewport ? observeWidth : undefined}
>
  <span class:sr-only={placed && !resizing}
    >{#if showFull}{full}{:else}<span class="edge-hint">{startHint}</span
      >{brief}<span class="edge-hint">{endHint}</span>{/if}</span
  >
  {#each segments as [key, segment] (key)}
    {@const position = segment[side] ?? segment.brief ?? segment.full}
    <span
      class="segment"
      class:changed={!segment.brief || !segment.full}
      class:hidden={!segment[side]}
      class:edge-hint={!showFull && segment.hint}
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
  }

  .text-diff.animating {
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
  }

  .animating .segment {
    transition:
      transform 0.4s var(--ease),
      opacity 0.25s ease-out,
      visibility 0.25s;
  }

  .text-diff.animating.resizing {
    transition: none;
  }

  .resizing .segment {
    display: none;
  }

  .edge-hint {
    color: var(--neutral-gray-500, #9c9c9c);
  }

  .animating .segment.changed {
    --delay: calc(0.1s + min(var(--i) * 8ms, 0.2s));
    transition-delay: 0s, var(--delay), var(--delay);
  }

  .segment.hidden {
    opacity: 0;
    visibility: hidden;
  }

  .animating .segment.hidden {
    transition-duration: 0.4s, 0.15s, 0.15s;
    transition-delay: 0s;
  }

  @media (prefers-reduced-motion: reduce) {
    .text-diff.animating,
    .animating .segment {
      transition: none;
    }
  }
</style>
