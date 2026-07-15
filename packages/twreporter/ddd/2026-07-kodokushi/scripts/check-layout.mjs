import assert from 'node:assert/strict'
import { subtractIntervals } from '../src/lib/layout.js'

assert.deepEqual(subtractIntervals(580, [[120, 240], [220, 320], [460, 700]]), [
  [0, 120],
  [320, 460],
])

console.log('layout interval check passed')
