import {
  layoutNextRichInlineLineRange,
  materializeRichInlineLineRange,
  prepareRichInline,
  type RichInlineCursor,
  type RichInlineItem,
} from '@chenglou/pretext/rich-inline'
import illustrationData from './illustrations.json'
import { subtractIntervals } from './lib/layout'

const BASE_WIDTH = 580
const PARAGRAPH_GAP = 40
const IMAGE_PADDING = 20
const ALPHA_THRESHOLD = 32
const EDITOR = location.hash === '#editor'
const editorMasks = new Map<string, Mask>()

type Spec = {
  key: string
  target: string
  anchor: number
  src: string
  alt: string
  x: number
  top: number
  width: number
}
const illustrations = illustrationData as Spec[]
type Annotation = { className: string; indicatorHTML: string; contentHTML: string }
type Chunk = { items: RichInlineItem[]; annotations: Map<number, Annotation> }
type Mask = Spec & {
  pixels: Uint8ClampedArray
  sampleWidth: number
  sampleHeight: number
  video: boolean
}

function directChildOf(element: Element, parent: Element): Element | null {
  let child: Element | null = element
  while (child?.parentElement && child.parentElement !== parent)
    child = child.parentElement
  return child?.parentElement === parent ? child : null
}

function sectionBlocks(start: Element, end: Element): HTMLElement[] {
  const ancestors = new Set<Element>()
  for (let element: Element | null = start; element; element = element.parentElement)
    ancestors.add(element)
  let parent: Element | null = end.parentElement
  while (parent && !ancestors.has(parent)) parent = parent.parentElement
  if (!parent) return []

  const startBlock = directChildOf(start, parent)
  const endBlock = directChildOf(end, parent)
  if (!startBlock || !endBlock) return []

  const blocks: HTMLElement[] = []
  for (let element = startBlock.nextElementSibling; element && element !== endBlock; element = element.nextElementSibling) {
    if (element instanceof HTMLElement && element.textContent?.trim()) blocks.push(element)
  }
  return blocks
}

function fontOf(style: CSSStyleDeclaration): string {
  return `${style.fontStyle} ${style.fontWeight} ${style.fontSize} ${style.fontFamily}`
}

function spacingOf(style: CSSStyleDeclaration): number {
  return style.letterSpacing === 'normal' ? 0 : Number.parseFloat(style.letterSpacing) || 0
}

function extractChunks(target: HTMLElement): Chunk[] {
  const base = getComputedStyle(target)
  const chunks: Chunk[] = [{ items: [], annotations: new Map() }]
  const current = () => chunks[chunks.length - 1]
  const pushText = (text: string) => {
    text.split('\n').forEach((part, index) => {
      if (index) chunks.push({ items: [], annotations: new Map() })
      if (!part) return
      const chunk = current()
      const last = chunk.items.at(-1)
      if (last && !chunk.annotations.has(chunk.items.length - 1)) last.text += part
      else chunk.items.push({ text: part, font: fontOf(base), letterSpacing: spacingOf(base) })
    })
  }

  for (const node of target.childNodes) {
    if (node.nodeType === Node.TEXT_NODE) {
      pushText(node.nodeValue ?? '')
      continue
    }
    if (!(node instanceof HTMLElement)) continue
    const annotated = node.querySelector<HTMLElement>('[class*="AnnotatedText"]')
    if (!annotated) {
      pushText(node.textContent ?? '')
      continue
    }
    const text = [...annotated.childNodes]
      .filter((child) => child.nodeType === Node.TEXT_NODE)
      .map((child) => child.nodeValue ?? '')
      .join('')
    if (!text) continue
    const indicator = annotated.querySelector<HTMLElement>('[class*="Indicator"]')
    const style = getComputedStyle(annotated)
    const chunk = current()
    chunk.annotations.set(chunk.items.length, {
      className: annotated.className,
      indicatorHTML: indicator?.outerHTML ?? '',
      contentHTML: node.querySelector('[class*="AnnotationContent"]')?.innerHTML ?? '',
    })
    chunk.items.push({
      text,
      font: fontOf(style),
      letterSpacing: spacingOf(style),
      extraWidth: indicator?.getBoundingClientRect().width ?? 0,
    })
  }
  return chunks
}

function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const image = new Image()
    image.crossOrigin = 'anonymous'
    image.onload = () => resolve(image)
    image.onerror = reject
    image.src = src
  })
}

function loadVideo(src: string): Promise<HTMLVideoElement> {
  return new Promise((resolve, reject) => {
    const video = document.createElement('video')
    video.crossOrigin = 'anonymous'
    video.muted = true
    video.preload = 'auto'
    video.onloadeddata = () => resolve(video)
    video.onerror = reject
    video.src = src
  })
}

async function createMask(spec: Spec): Promise<Mask> {
  let video = spec.src.endsWith('.webm')
  let source: HTMLImageElement | HTMLVideoElement
  try {
    source = video ? await loadVideo(spec.src) : await loadImage(spec.src)
  } catch (error) {
    if (!video) throw error
    console.warn('Falling back to a static illustration', spec.src, error)
    return createMask({ ...spec, src: spec.src.replace('/vid/', '/img/').replace(/\.webm$/, '.png') })
  }
  const sampleWidth = 480
  const sourceWidth = video ? (source as HTMLVideoElement).videoWidth : (source as HTMLImageElement).width
  const sourceHeight = video ? (source as HTMLVideoElement).videoHeight : (source as HTMLImageElement).height
  const sampleHeight = Math.round((sourceHeight / sourceWidth) * sampleWidth)
  const canvas = document.createElement('canvas')
  canvas.width = sampleWidth
  canvas.height = sampleHeight
  const context = canvas.getContext('2d', { willReadFrequently: true })
  if (!context) throw new Error('Canvas is unavailable')
  let pixels: Uint8ClampedArray
  if (video) {
    pixels = new Uint8ClampedArray(sampleWidth * sampleHeight * 4)
    const union = () => {
      context.drawImage(source, 0, 0, sampleWidth, sampleHeight)
      const frame = context.getImageData(0, 0, sampleWidth, sampleHeight).data
      for (let index = 3; index < frame.length; index += 4)
        pixels[index] = Math.max(pixels[index], frame[index])
    }
    union()
    const element = source as HTMLVideoElement
    if (Number.isFinite(element.duration)) {
      for (let step = 1; step < 5; step += 1) {
        element.currentTime = element.duration * (step / 5)
        await new Promise<void>((resolve) => element.addEventListener('seeked', () => resolve(), { once: true }))
        union()
      }
    }
  } else {
    context.drawImage(source, 0, 0, sampleWidth, sampleHeight)
    pixels = context.getImageData(0, 0, sampleWidth, sampleHeight).data
  }
  return { ...spec, pixels, sampleWidth, sampleHeight, video }
}

function blockedIntervals(mask: Mask, y: number, scale: number, top = mask.top * scale): [number, number][] {
  const width = mask.width * scale
  const pixelScale = width / mask.sampleWidth
  const row = Math.floor((y - top) / pixelScale)
  if (row < 0 || row >= mask.sampleHeight) return []
  const intervals: [number, number][] = []
  let start: number | null = null
  for (let column = 0; column < mask.sampleWidth; column += 1) {
    const alpha = mask.pixels[(row * mask.sampleWidth + column) * 4 + 3]
    if (alpha > ALPHA_THRESHOLD && start === null) start = column
    if ((alpha <= ALPHA_THRESHOLD || column === mask.sampleWidth - 1) && start !== null) {
      const end = alpha > ALPHA_THRESHOLD ? column + 1 : column
      intervals.push([
        mask.x * scale + start * pixelScale - IMAGE_PADDING * scale,
        mask.x * scale + end * pixelScale + IMAGE_PADDING * scale,
      ])
      start = null
    }
  }
  return intervals
}

async function copyConfig(): Promise<void> {
  const config = illustrations.map((spec) => {
    const edited = editorMasks.get(spec.key)
    return edited
      ? { ...spec, x: edited.x, top: edited.top, width: edited.width }
      : spec
  })
  try {
    await navigator.clipboard.writeText(JSON.stringify(config, null, 2))
    console.info('[kodokushi editor] Updated layout copied to clipboard.', config)
  } catch (error) {
    console.error('[kodokushi editor] Could not copy layout to clipboard.', error)
  }
}

function enableEditor(element: HTMLElement, mask: Mask, scale: number, masks: Mask[], repaint: () => void): void {
  element.title = 'Drag to move; Shift-drag to resize'
  Object.assign(element.style, { pointerEvents: 'auto', cursor: 'move', outline: '1px dashed #e60000' })
  element.addEventListener('pointerdown', (event) => {
    event.preventDefault()
    const start = { clientX: event.clientX, clientY: event.clientY, x: mask.x, top: mask.top, width: mask.width }
    const resize = event.shiftKey
    const move = (next: PointerEvent) => {
      const dx = (next.clientX - start.clientX) / scale
      const dy = (next.clientY - start.clientY) / scale
      if (resize) mask.width = Math.max(50, Math.round(start.width + dx))
      else {
        mask.x = Math.round(start.x + dx)
        mask.top = Math.round(start.top + dy)
      }
      repaint()
    }
    const stop = () => {
      window.removeEventListener('pointermove', move)
      void copyConfig()
    }
    window.addEventListener('pointermove', move)
    window.addEventListener('pointerup', stop, { once: true })
  })
}

function mediaElement(mask: Mask, scale: number, masks: Mask[], repaint: () => void, top = mask.top * scale): HTMLElement {
  const element = mask.video ? document.createElement('video') : document.createElement('img')
  if (element instanceof HTMLVideoElement) {
    element.autoplay = true
    element.loop = true
    element.muted = true
    element.playsInline = true
    element.setAttribute('aria-label', mask.alt)
  } else element.alt = mask.alt
  element.src = mask.src
  Object.assign(element.style, {
    position: 'absolute', left: `${mask.x * scale}px`, top: `${top}px`,
    width: `${mask.width * scale}px`, height: 'auto', pointerEvents: 'none',
  })
  if (EDITOR) enableEditor(element, mask, scale, masks, repaint)
  return element
}

async function rewrapSection(section: string, blocks: HTMLElement[], specs: Spec[]): Promise<void> {
  const paragraphs = blocks.map((block) => {
    const chunks = extractChunks(block)
    return {
      chunks,
      prepared: chunks.map((chunk) => chunk.items.length ? prepareRichInline(chunk.items) : null),
    }
  })
  const masks = (await Promise.allSettled(specs.map(createMask)))
    .flatMap((result) => result.status === 'fulfilled' ? [result.value] : [])
  if (!masks.length) return
  for (const mask of masks) {
    if (mask.anchor >= paragraphs.length)
      console.warn(`${mask.key} targets missing paragraph ${mask.anchor} in ${section}`)
  }
  if (EDITOR) for (const mask of masks) editorMasks.set(mask.key, mask)

  const target = document.createElement('div')
  target.className = blocks[0].className
  target.style.cssText = blocks[0].style.cssText
  target.dataset.dddFlow = section
  blocks[0].before(target)
  for (const block of blocks) block.remove()

  let lastKey = ''

  const paint = () => {
    const style = getComputedStyle(target)
    const pad = { left: parseFloat(style.paddingLeft), right: parseFloat(style.paddingRight), top: parseFloat(style.paddingTop), bottom: parseFloat(style.paddingBottom) }
    const width = target.clientWidth - pad.left - pad.right
    const lineHeight = style.lineHeight === 'normal' ? parseFloat(style.fontSize) * 1.5 : parseFloat(style.lineHeight)
    const key = `${width}:${lineHeight}:${pad.left}:${pad.right}`
    if ((!EDITOR && key === lastKey) || width <= 0) return
    lastKey = key
    const scale = width / BASE_WIDTH
    const output = document.createDocumentFragment()
    const active = new Map<Annotation, { spans: HTMLElement[]; lastY: number }>()
    const positioned: Array<{ mask: Mask; top: number }> = []
    let y = 0

    for (let paragraphIndex = 0; paragraphIndex < paragraphs.length; paragraphIndex += 1) {
      for (const mask of masks.filter((item) => item.anchor === paragraphIndex)) {
        const top = y + mask.top * scale
        positioned.push({ mask, top })
        output.append(mediaElement(mask, scale, masks, paint, top))
      }

      const paragraph = paragraphs[paragraphIndex]
      for (let chunkIndex = 0; chunkIndex < paragraph.chunks.length; chunkIndex += 1) {
        const data = paragraph.prepared[chunkIndex]
        if (!data) { y += lineHeight; continue }
        let cursor: RichInlineCursor | undefined
        while (true) {
          const blocked = positioned.flatMap(({ mask, top }) =>
            [y + 3, y + lineHeight / 2, y + lineHeight - 3]
              .flatMap((row) => blockedIntervals(mask, row, scale, top)),
          )
          const segments = subtractIntervals(width, blocked)
          let progressed = false
          for (const [start, end] of segments) {
            const range = layoutNextRichInlineLineRange(data, end - start, cursor)
            if (!range) continue
            progressed = true
            const line = materializeRichInlineLineRange(data, range)
            let x = pad.left + start
            for (const fragment of line.fragments) {
              x += fragment.gapBefore
              const item = paragraph.chunks[chunkIndex].items[fragment.itemIndex]
              const span = document.createElement('span')
              span.textContent = fragment.text
              Object.assign(span.style, { font: item.font, letterSpacing: `${item.letterSpacing ?? 0}px`, position: 'absolute', left: `${x}px`, top: `${pad.top + y}px`, lineHeight: `${lineHeight}px`, whiteSpace: 'nowrap' })
              const annotation = paragraph.chunks[chunkIndex].annotations.get(fragment.itemIndex)
              if (annotation) {
                span.className = annotation.className
                span.style.cursor = 'pointer'
                const state = active.get(annotation) ?? { spans: [], lastY: 0 }
                state.spans.push(span); state.lastY = y; active.set(annotation, state)
              }
              output.append(span)
              x += fragment.occupiedWidth
            }
            cursor = line.end
          }
          if (!progressed) {
            y += lineHeight
            continue
          }
          y += lineHeight
          if (!layoutNextRichInlineLineRange(data, width, cursor)) break
        }
      }
      if (paragraphIndex < paragraphs.length - 1) y += PARAGRAPH_GAP
    }

    for (const [annotation, state] of active) {
      state.spans.at(-1)?.insertAdjacentHTML('beforeend', annotation.indicatorHTML)
      const popover = document.createElement('div')
      popover.className = 'pretext-annotation-popover'
      popover.innerHTML = annotation.contentHTML
      Object.assign(popover.style, { display: 'none', position: 'absolute', top: `${pad.top + state.lastY + lineHeight + 4}px`, left: `${pad.left}px`, right: `${pad.right}px`, zIndex: '2', padding: '12px 16px', background: '#fff', border: '1px solid #ddd', boxShadow: '0 2px 8px rgba(0,0,0,.12)' })
      output.append(popover)
      for (const span of state.spans) span.addEventListener('click', () => { popover.style.display = popover.style.display === 'none' ? 'block' : 'none' })
    }
    const imageBottom = positioned.reduce(
      (bottom, { mask, top }) =>
        Math.max(bottom, top + mask.width * scale * mask.sampleHeight / mask.sampleWidth),
      0,
    )
    target.style.position = 'relative'
    target.style.overflow = 'visible'
    const boxHeight = Math.max(pad.top + y + pad.bottom, imageBottom)
    target.style.height = style.boxSizing === 'border-box' ? `${boxHeight}px` : `${boxHeight - pad.top - pad.bottom}px`
    target.replaceChildren(output)
  }
  paint()
  window.addEventListener('resize', paint)
}

async function main(): Promise<void> {
  if (location.hostname === 'keystone-editor.twreporter.org') return
  await document.fonts?.ready
  const grouped = illustrations.reduce<Record<string, Spec[]>>((result, spec) => {
    (result[spec.target] ??= []).push(spec)
    return result
  }, {})
  const anchors = [...document.querySelectorAll<HTMLElement>('div.ddd-anchor[data-section][data-type]')]
  await Promise.all(Object.entries(grouped).map(async ([section, specs]) => {
    const start = anchors.find((anchor) => anchor.dataset.section === section && anchor.dataset.type === 'start')
    const end = anchors.find((anchor) => anchor.dataset.section === section && anchor.dataset.type === 'end')
    if (!start || !end) return console.warn(`Missing ${section} start/end anchors`)
    const blocks = sectionBlocks(start, end)
    if (blocks.length) await rewrapSection(section, blocks, specs)
  }))
}

void main()
