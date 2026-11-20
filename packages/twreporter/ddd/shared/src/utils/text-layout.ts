import {
  layoutWithLines,
  measureNaturalWidth,
  prepareWithSegments,
  type PreparedTextWithSegments,
} from '@chenglou/pretext'

const segmenter = new Intl.Segmenter(undefined, { granularity: 'grapheme' })

export function placeTextSegments(
  prepared: PreparedTextWithSegments,
  font: string,
  width: number,
  lineHeight: number,
) {
  const { lines, height } = layoutWithLines(prepared, width, lineHeight)
  const segments = lines.flatMap(
    ({ start, end, width: lineWidth, text }, line) => {
      const positioned: {
        index: number
        from: number
        text: string
        x: number
        y: number
      }[] = []
      const endIndex = end.segmentIndex + Number(end.graphemeIndex > 0)
      let x = 0
      for (let index = start.segmentIndex; index < endIndex; index++) {
        const kind = prepared.kinds[index]
        const original = prepared.segments[index]
        const from = index === start.segmentIndex ? start.graphemeIndex : 0
        const to = index === end.segmentIndex ? end.graphemeIndex : undefined
        const partial = from > 0 || to !== undefined
        let value = original
        if (partial) {
          value = Array.from(
            segmenter.segment(original),
            ({ segment }) => segment,
          )
            .slice(from, to)
            .join('')
        }

        const spacing =
          prepared.spacingGraphemeCounts[index] > 0 ? prepared.letterSpacing : 0
        if (kind === 'tab') {
          const tab = prepared.tabStopAdvance
          if (tab > 0) x += tab - (x % tab) + spacing
          continue
        }
        if (
          kind === 'soft-hyphen' &&
          index === endIndex - 1 &&
          text.endsWith('-')
        )
          value = '-'
        if (value.trim() && kind !== 'zero-width-break' && value !== '\u00ad') {
          positioned.push({ index, from, text: value, x, y: line * lineHeight })
        }
        x += partial
          ? measureNaturalWidth(
              prepareWithSegments(value, font, {
                whiteSpace: 'pre-wrap',
                letterSpacing: prepared.letterSpacing,
              }),
            )
          : prepared.widths[index] + spacing
      }

      const endKind = prepared.kinds[endIndex - 1]
      const softWrap = line < lines.length - 1 && endKind !== 'hard-break'
      const gaps =
        positioned.length -
        1 -
        Number(endKind === 'soft-hyphen' && text.endsWith('-'))
      if (!softWrap || gaps < 1) return positioned

      const gap = Math.max(0, width - lineWidth) / gaps
      return positioned.map((segment, index) => ({
        ...segment,
        x: segment.x + gap * Math.min(index, gaps),
      }))
    },
  )

  return { segments, height }
}
