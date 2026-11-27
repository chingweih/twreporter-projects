import {
  collectGraphicsEvent,
  type GraphicExport,
} from '../../utils/graphic-download.ts'

export async function collectPageGraphics(document: Document) {
  const view = document.defaultView
  const scroller = document.scrollingElement

  if (view && scroller) {
    const { scrollX, scrollY } = view
    const nextFrame = () =>
      new Promise<void>((resolve) =>
        view.requestAnimationFrame(() => resolve()),
      )

    try {
      view.scrollTo({ top: 0, behavior: 'instant' })
      await nextFrame()

      // An instant jump to the bottom can skip lazy embeds between viewports.
      while (view.scrollY + view.innerHeight < scroller.scrollHeight - 1) {
        const top = view.scrollY
        view.scrollTo({ top: top + view.innerHeight, behavior: 'instant' })
        await nextFrame()
        if (view.scrollY <= top) break
      }
    } finally {
      view.scrollTo({ left: scrollX, top: scrollY, behavior: 'instant' })
    }
    await nextFrame()
  }

  const pendingEmbeds = Array.from(
    document.querySelectorAll('.embed-code-container > :not(:defined)'),
  ).filter((element) => element.localName.startsWith('twreporter-'))
  const deadline = performance.now() + 10_000
  while (true) {
    const graphics: GraphicExport[] = []
    document.dispatchEvent(
      new CustomEvent(collectGraphicsEvent, { detail: graphics }),
    )
    const loading = graphics.some((graphic) => graphic.loading)
    const pending = pendingEmbeds.filter(
      (element) => element.isConnected && !element.matches(':defined'),
    ).length
    if ((!loading && !pending) || performance.now() >= deadline) {
      return { graphics, pending }
    }
    await new Promise((resolve) => setTimeout(resolve, 100))
  }
}
