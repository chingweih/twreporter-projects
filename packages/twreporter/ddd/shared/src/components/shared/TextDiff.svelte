<script lang="ts">
  import { diffChars } from 'diff'
  import {
    placeGraphemes,
    prepareGraphemes,
    type Typography,
  } from '../../utils/text-layout'

  let {
    full,
    brief,
    showFull = false,
  }: { full: string; brief: string; showFull?: boolean } = $props()

  type Position = { x: number; y: number }
  type Unit = {
    key: string
    text: string
    part: number
    offset: number
    changed: boolean
    brief?: Position
    full?: Position
  }

  let rect = $state<DOMRectReadOnly>()
  let typography = $state<Typography>()

  const width = $derived(rect?.width)
  const side = $derived(showFull ? 'full' : 'brief')
  const diffs = $derived(diffChars(brief, full))
  const prepared = $derived(
    typography && {
      brief: prepareGraphemes(brief, typography),
      full: prepareGraphemes(full, typography),
    },
  )
  const placed = $derived(
    prepared && typography && width
      ? {
          brief: placeGraphemes(prepared.brief, width, typography.lineHeight),
          full: placeGraphemes(prepared.full, width, typography.lineHeight),
        }
      : undefined,
  )

  const units = $derived.by(() => {
    if (!placed) return []
    const units = new Map<string, Unit>()
    for (const side of ['brief', 'full'] as const) {
      const parts = diffs
        .map((diff, part) => ({ diff, part }))
        .filter(({ diff }) => (side === 'full' ? !diff.removed : !diff.added))
      let index = 0
      let partStart = 0
      for (const { text, offset, x, y } of placed[side].graphemes) {
        while (
          index < parts.length - 1 &&
          offset >= partStart + parts[index].diff.value.length
        ) {
          partStart += parts[index].diff.value.length
          index++
        }
        const { diff, part } = parts[index]
        const key = `${part}:${offset - partStart}`
        const unit = units.get(key) ?? {
          key,
          text,
          part,
          offset: offset - partStart,
          changed: Boolean(diff.added || diff.removed),
        }
        unit[side] = { x, y }
        units.set(key, unit)
      }
    }
    return [...units.values()].sort(
      (a, b) => a.part - b.part || a.offset - b.offset,
    )
  })

  function readTypography(node: HTMLElement) {
    const style = getComputedStyle(node)
    const font = `${style.fontStyle} ${style.fontWeight} ${style.fontSize} ${style.fontFamily}`
    document.fonts.load(font, brief + full).then(() => {
      typography = {
        font,
        lineHeight: parseFloat(style.lineHeight),
        letterSpacing: parseFloat(style.letterSpacing) || 0,
      }
    })
  }
</script>

<div
  class="text-diff"
  style:height={placed ? `${placed[side].height}px` : undefined}
  bind:contentRect={rect}
  {@attach readTypography}
>
  <span class:sr-only={placed}>{showFull ? full : brief}</span>
  {#each units as unit (unit.key)}
    {@const position = unit[side] ?? unit.brief ?? unit.full}
    <span
      class="grapheme"
      class:changed={unit.changed}
      class:hidden={!unit[side]}
      style:--i={unit.offset}
      style:transform="translate({position?.x}px, {position?.y}px)"
      aria-hidden="true">{unit.text}</span
    >
  {/each}
</div>

<style>
  .text-diff {
    --ease: cubic-bezier(0.2, 0, 0, 1);

    position: relative;
    overflow-y: clip;
    white-space: pre-wrap;
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

  .grapheme {
    position: absolute;
    top: 0;
    left: 0;
    white-space: pre;
    transition:
      transform 0.4s var(--ease),
      opacity 0.25s ease-out,
      visibility 0.25s;
  }

  .grapheme.changed {
    --delay: calc(0.1s + min(var(--i) * 8ms, 0.2s));

    transition-delay: 0s, var(--delay), var(--delay);
  }

  .grapheme.hidden {
    opacity: 0;
    visibility: hidden;
    transition-duration: 0.4s, 0.15s, 0.15s;
    transition-delay: 0s;
  }

  @media (prefers-reduced-motion: reduce) {
    .text-diff,
    .grapheme {
      transition: none;
    }
  }
</style>
