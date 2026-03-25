import type { Readable } from 'svelte/store'
import { get } from 'svelte/store'

/**
 * Reads audio currentTime on every animation frame for smooth PlayerHead movement.
 * The HTML audio element's `timeupdate` fires ~4fps; this gives ~60fps updates.
 */
export function useAnimationFrameTime(
  currentTime: Readable<number>,
  paused: Readable<boolean>,
) {
  let smoothTime = $state(get(currentTime))
  let rafId: number | null = null
  let isPaused = $state(get(paused))

  // Track paused state reactively via subscription
  const unsubPaused = paused.subscribe((v) => (isPaused = v))

  function tick() {
    smoothTime = get(currentTime)
    rafId = requestAnimationFrame(tick)
  }

  $effect(() => {
    if (!isPaused) {
      rafId = requestAnimationFrame(tick)
    } else {
      if (rafId != null) cancelAnimationFrame(rafId)
      rafId = null
      smoothTime = get(currentTime)
    }
    return () => {
      if (rafId != null) cancelAnimationFrame(rafId)
    }
  })

  // Sync when paused (e.g. seek while paused)
  const unsubTime = currentTime.subscribe((v) => {
    if (isPaused) smoothTime = v
  })

  return {
    get currentTime() {
      return smoothTime
    },
    destroy() {
      unsubPaused()
      unsubTime()
      if (rafId != null) cancelAnimationFrame(rafId)
    },
  }
}
