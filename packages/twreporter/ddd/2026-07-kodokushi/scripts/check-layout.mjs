import assert from 'node:assert/strict'
import { subtractIntervals } from '../src/lib/layout.js'

assert.deepEqual(subtractIntervals(580, [[120, 240], [220, 320], [460, 700]]), [
  [0, 120],
  [320, 460],
])

// subtractIntervals returns [start, end] pairs, not [x, width] — a line placed at
// x must be laid out with maxWidth = end - x, or it overflows the 580px column.
for (const [x, end] of subtractIntervals(580, [[0, 355]])) {
  assert.ok(x + (end - x) <= 580, `line at ${x} would end at ${x + (end - x)}`)
}

// The rows that broke buildFlow: an image covering the column leaves no segments,
// and one nearly covering it leaves only unusably narrow ones. layoutNextLineRange
// returns null for both, same as for end-of-text — so buildFlow probes at full width
// to tell them apart and must advance past these rows, not drop the paragraph.
assert.deepEqual(subtractIntervals(580, [[0, 580]]), [])
assert.deepEqual(subtractIntervals(580, [[0, 578]]), [[578, 580]])

console.log('layout interval check passed')
