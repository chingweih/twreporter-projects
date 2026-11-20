import {
  layoutWithLines,
  measureNaturalWidth,
  prepareWithSegments,
} from '@chenglou/pretext'

export type Typography = {
  font: string
  lineHeight: number
  letterSpacing: number
}

const graphemeSegmenter = new Intl.Segmenter(undefined, {
  granularity: 'grapheme',
})

export function prepareGraphemes(
  text: string,
  { font, letterSpacing }: Typography,
) {
  const options = { whiteSpace: 'pre-wrap', letterSpacing } as const
  const prepared = prepareWithSegments(text, font, options)
  let segmentOffset = 0
  const segments = prepared.segments.map((segment) => {
    const graphemes = Array.from(
      graphemeSegmenter.segment(segment),
      ({ segment: grapheme, index }) => ({
        text: grapheme,
        offset: segmentOffset + index,
        x:
          index &&
          measureNaturalWidth(
            prepareWithSegments(segment.slice(0, index), font, options),
          ),
      }),
    )
    segmentOffset += segment.length
    return graphemes
  })
  return { prepared, segments }
}

export function placeGraphemes(
  { prepared, segments }: ReturnType<typeof prepareGraphemes>,
  width: number,
  lineHeight: number,
) {
  const { lines, height } = layoutWithLines(prepared, width, lineHeight)
  const graphemes = lines.flatMap(({ start, end }, line) => {
    const placed = []
    let x = 0
    for (
      let index = start.segmentIndex;
      index < end.segmentIndex ||
      (index === end.segmentIndex && end.graphemeIndex > 0);
      index++
    ) {
      const segment = segments[index]
      const from = index === start.segmentIndex ? start.graphemeIndex : 0
      const to = index === end.segmentIndex ? end.graphemeIndex : segment.length
      const origin = x - segment[from].x
      for (const grapheme of segment.slice(from, to)) {
        placed.push({
          ...grapheme,
          x: origin + grapheme.x,
          y: line * lineHeight,
        })
      }
      x = origin + (segment[to]?.x ?? prepared.widths[index])
    }
    return placed
  })
  return { graphemes, height }
}
