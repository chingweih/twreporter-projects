import {
  collectGraphicsEvent,
  type GraphicExport,
} from '../../utils/graphic-download.ts'

function documentPath(element: Element | undefined) {
  const path: Element[] = []
  while (element?.isConnected) {
    path.unshift(element)
    const root = element.getRootNode()
    element = root instanceof ShadowRoot ? root.host : undefined
  }
  return path
}

function inDocumentOrder(graphics: GraphicExport[]) {
  return graphics
    .map((graphic) => ({ graphic, path: documentPath(graphic.element) }))
    .sort(({ path: first }, { path: second }) => {
      // Older embeds can still export without reporting their DOM position.
      if (!first.length) return second.length ? 1 : 0
      if (!second.length) return -1

      for (const [index, element] of first.entries()) {
        const other = second[index]
        if (!other) return 1
        if (element === other) continue
        // Compare the first differing nodes in their shared document or shadow root.
        const position = element.compareDocumentPosition(other)
        return position & Node.DOCUMENT_POSITION_FOLLOWING ? -1 : 1
      }
      return first.length - second.length
    })
    .map(({ graphic }) => graphic)
}

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
      return { graphics: inDocumentOrder(graphics), pending }
    }
    await new Promise((resolve) => setTimeout(resolve, 100))
  }
}
