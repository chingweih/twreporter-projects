import type { NodeMeta } from '../constants/scroll-diagram'

const NODE_SELECTOR = '[id^="node__"]'

export function computeNodePositions(container: HTMLElement) {
  const positions = new Map<string, { cx: number; cy: number }>()

  for (const el of container.querySelectorAll(NODE_SELECTOR)) {
    const id = el.getAttribute('id')
    if (!id) continue
    const bbox = (el as SVGGraphicsElement).getBBox()
    positions.set(id, {
      cx: bbox.x + bbox.width / 2,
      cy: bbox.y + bbox.height / 2,
    })
  }

  return positions
}

export function attachNodeClickHandlers(
  container: HTMLElement,
  nodeMap: Map<string, NodeMeta>,
  onClick: (meta: NodeMeta) => void,
) {
  const cleanups: Array<() => void> = []

  for (const el of container.querySelectorAll(NODE_SELECTOR)) {
    const id = el.getAttribute('id')
    if (!id) continue

    const meta = nodeMap.get(id)
    if (!meta) continue

    ;(el as HTMLElement).style.cursor = 'pointer'

    const handler = (e: Event) => {
      e.stopPropagation()
      onClick(meta)
    }
    el.addEventListener('click', handler)
    cleanups.push(() => el.removeEventListener('click', handler))
  }

  return () => cleanups.forEach((fn) => fn())
}
