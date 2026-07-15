export function subtractIntervals(width, intervals, gap = 6) {
  const merged = intervals
    .map(([start, end]) => [Math.max(0, start), Math.min(width, end)])
    .filter(([start, end]) => end > start)
    .sort(([a], [b]) => a - b)
    .reduce((result, interval) => {
      const previous = result.at(-1)
      if (previous && interval[0] <= previous[1] + gap) {
        previous[1] = Math.max(previous[1], interval[1])
      } else {
        result.push(interval)
      }
      return result
    }, [])

  const available = []
  let cursor = 0
  for (const [start, end] of merged) {
    if (start > cursor) available.push([cursor, start])
    cursor = Math.max(cursor, end)
  }
  if (cursor < width) available.push([cursor, width])
  return available
}
