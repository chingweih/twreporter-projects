import type { NodeMeta } from '../constants/scroll-diagram'

const NODE_SELECTOR = '[id^="node__"]'

export type NodeBounds = {
  x: number
  y: number
  width: number
  height: number
  cx: number
  cy: number
}

export function computeNodeBounds(container: HTMLElement) {
  const bounds = new Map<string, NodeBounds>()

  for (const el of container.querySelectorAll(NODE_SELECTOR)) {
    const id = el.getAttribute('id')
    if (!id) continue
    const bbox = (el as SVGGraphicsElement).getBBox()
    bounds.set(id, {
      x: bbox.x,
      y: bbox.y,
      width: bbox.width,
      height: bbox.height,
      cx: bbox.x + bbox.width / 2,
      cy: bbox.y + bbox.height / 2,
    })
  }

  return bounds
}

const PADDING_FACTOR = 0.15

export function computeGroupView(
  prefix: string,
  allBounds: Map<string, NodeBounds>,
  viewportWidth: number,
  viewportHeight: number,
): { cx: number; cy: number; scale: number } | null {
  let minX = Infinity
  let minY = Infinity
  let maxX = -Infinity
  let maxY = -Infinity
  let count = 0

  for (const [id, b] of allBounds) {
    if (!id.startsWith(prefix)) continue
    minX = Math.min(minX, b.x)
    minY = Math.min(minY, b.y)
    maxX = Math.max(maxX, b.x + b.width)
    maxY = Math.max(maxY, b.y + b.height)
    count++
  }

  if (count === 0) return null

  const groupW = maxX - minX
  const groupH = maxY - minY
  const cx = minX + groupW / 2
  const cy = minY + groupH / 2

  const padW = groupW * (1 + PADDING_FACTOR * 2)
  const padH = groupH * (1 + PADDING_FACTOR * 2)

  const scale = Math.min(viewportWidth / padW, viewportHeight / padH)

  return { cx, cy, scale }
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
