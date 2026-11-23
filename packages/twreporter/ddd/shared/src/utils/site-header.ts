import type { Attachment } from 'svelte/attachments'

export const followTwreporterHeader: Attachment<HTMLElement> = (element) => {
  const narrowThreshold = 40
  const hideThreshold = 8
  const resizeDuration = 800
  let visible = true
  let previousY = window.scrollY
  let hideFromY = previousY
  let narrow = previousY > narrowThreshold
  let resizingUntil = 0
  let frame: number | undefined

  const updateOffset = () => {
    element.style.setProperty('--site-header-offset', visible ? '64px' : '0px')
    element.style.setProperty(
      '--site-header-transition',
      visible ? '300ms ease-out' : '300ms ease-in',
    )
  }

  const update = (time: number) => {
    frame = undefined
    const y = window.scrollY
    const scrollingDown = y > previousY
    previousY = y

    if (time < resizingUntil) {
      hideFromY = y
      return
    }
    const wasVisible = visible
    if (!scrollingDown) {
      hideFromY = y
      visible = true
    } else if (narrow && y - hideFromY > hideThreshold) {
      visible = false
    }
    if (visible !== wasVisible) updateOffset()

    const pastThreshold = y > narrowThreshold
    const nextNarrow = scrollingDown
      ? narrow || pastThreshold
      : narrow && pastThreshold
    if (nextNarrow !== narrow) {
      narrow = nextNarrow
      hideFromY = y
      resizingUntil = time + resizeDuration
    }
  }
  const onScroll = () => {
    frame ??= window.requestAnimationFrame(update)
  }

  updateOffset()
  window.addEventListener('scroll', onScroll, { passive: true })
  return () => {
    window.removeEventListener('scroll', onScroll)
    if (frame !== undefined) window.cancelAnimationFrame(frame)
    element.style.removeProperty('--site-header-offset')
    element.style.removeProperty('--site-header-transition')
  }
}
