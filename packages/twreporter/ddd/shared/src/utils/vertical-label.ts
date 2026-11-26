export function verticalLabelParts(
  text: string,
  horizontalTexts: readonly string[] = [],
) {
  const words = [...new Set(horizontalTexts.filter((word) => word.length > 0))]
    .sort((a, b) => b.length - a.length)
    .map((word) => word.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'))
  const pattern = new RegExp(`(${[...words, '\\d+'].join('|')})`, 'g')
  return text
    .split(pattern)
    .filter(Boolean)
    .map((part) => ({
      text: part,
      horizontal: horizontalTexts.includes(part) || /^\d+$/.test(part),
    }))
}
