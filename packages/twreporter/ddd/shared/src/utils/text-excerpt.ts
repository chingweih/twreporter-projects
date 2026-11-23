import { diffChars } from 'diff'

const graphemes = new Intl.Segmenter(undefined, { granularity: 'grapheme' })
const edgeHintLength = 5

export function textExcerpt(full: string, brief: string) {
  const text = brief.trim()
  if (!text) return { text, start: '', end: '' }
  const diff = diffChars(full.trim(), text)
  // Only omissions with text at either edge get hints. Keep punctuation from the original.
  const hasText = ({ value }: (typeof diff)[number]) =>
    /[\p{L}\p{N}]/u.test(value)
  const first = diff.findIndex(hasText)
  let last = diff.length - 1
  while (last >= 0 && !hasText(diff[last])) last--
  const prefix = diff[first]?.removed
    ? diff
        .slice(0, first + 1)
        .flatMap(({ added, value }) => (added ? [] : [value]))
        .join('')
    : ''
  const suffix = diff[last]?.removed
    ? diff
        .slice(last)
        .flatMap(({ added, value }) => (added ? [] : [value]))
        .join('')
    : ''
  return {
    text,
    start: prefix
      ? Array.from(graphemes.segment(prefix), ({ segment }) => segment)
          .slice(0, edgeHintLength)
          .join('') + '⋯'
      : '',
    end: suffix
      ? '⋯' +
        Array.from(graphemes.segment(suffix), ({ segment }) => segment)
          .slice(-edgeHintLength)
          .join('')
      : '',
  }
}
