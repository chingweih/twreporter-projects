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
const IMAGE_PADDING = 20
const ALPHA_THRESHOLD = 32
const EDITOR = location.hash === '#editor'
const mobileLayout = window.innerWidth < 768
const editorMasks = new Map<number, Mask>()

type Spec = {
  target: string
  anchor: number
  src: string
  x: number
  top: number
  width: number
}
type LayoutKey = 'desktop' | 'mobile'
type LayoutConfig = Record<LayoutKey, Spec[]>
const config = illustrationData as LayoutConfig
const layoutKey: LayoutKey = mobileLayout ? 'mobile' : 'desktop'
type IndexedSpec = Spec & { index: number }
const illustrations: IndexedSpec[] = config[layoutKey].map((spec, index) => ({
  ...spec,
  index,
}))
type Annotation = {
  className: string
  indicatorHTML: string
  contentClassName: string
  contentHTML: string
}
type InlineContent = {
  items: RichInlineItem[]
  annotations: Map<number, Annotation>
}
type BlockData = {
  template: HTMLElement
  heading: boolean
  content: InlineContent
  prepared: ReturnType<typeof prepareRichInline> | null
  pad: { left: number; right: number; top: number; bottom: number }
  margin: { top: number; bottom: number }
  lineHeight: number
}
type Mask = IndexedSpec & {
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

function extractInlineContent(target: HTMLElement): InlineContent {
  const base = getComputedStyle(target)
  const content: InlineContent = { items: [], annotations: new Map() }
  const pushText = (text: string) => {
    if (!text) return
    const last = content.items.at(-1)
    if (last && !content.annotations.has(content.items.length - 1)) last.text += text
    else content.items.push({ text, font: fontOf(base), letterSpacing: spacingOf(base) })
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
    const annotationContent = node.querySelector<HTMLElement>('[class*="AnnotationContent"]')
    const style = getComputedStyle(annotated)
    content.annotations.set(content.items.length, {
      className: annotated.className,
      indicatorHTML: indicator?.outerHTML ?? '',
      contentClassName: annotationContent?.className ?? '',
      contentHTML: annotationContent?.innerHTML ?? '',
    })
    content.items.push({
      text,
      font: fontOf(style),
      letterSpacing: spacingOf(style),
      extraWidth: indicator?.getBoundingClientRect().width ?? 0,
    })
  }
  return content
}

function readNumber(value: string): number {
  return Number.parseFloat(value) || 0
}

function createBlockData(block: HTMLElement): BlockData {
  const style = getComputedStyle(block)
  const content = extractInlineContent(block)
  return {
    template: block.cloneNode(false) as HTMLElement,
    heading: block.matches('h1, h2, h3, h4, h5, h6, [role="heading"]'),
    content,
    prepared: content.items.length ? prepareRichInline(content.items) : null,
    pad: {
      left: readNumber(style.paddingLeft),
      right: readNumber(style.paddingRight),
      top: readNumber(style.paddingTop),
      bottom: readNumber(style.paddingBottom),
    },
    margin: {
      top: readNumber(style.marginTop),
      bottom: readNumber(style.marginBottom),
    },
    lineHeight:
      style.lineHeight === 'normal'
        ? readNumber(style.fontSize) * 1.5
        : readNumber(style.lineHeight),
  }
}

function loadImage(src: string, cors = true): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const image = new Image()
    if (cors) image.crossOrigin = 'anonymous'
    image.onload = () => resolve(image)
    image.onerror = reject
    image.src = src
  })
}

function loadVideo(src: string, cors = true): Promise<HTMLVideoElement> {
  return new Promise((resolve, reject) => {
    const video = document.createElement('video')
    if (cors) video.crossOrigin = 'anonymous'
    video.muted = true
    video.preload = 'auto'
    video.onloadeddata = () => resolve(video)
    video.onerror = reject
    video.src = src
  })
}

async function createMask(spec: IndexedSpec): Promise<Mask> {
  const video = spec.src.endsWith('.webm')
  let source: HTMLImageElement | HTMLVideoElement
  let readable = true
  try {
    source = video ? await loadVideo(spec.src) : await loadImage(spec.src)
  } catch (error) {
    readable = false
    try {
      source = video
        ? await loadVideo(spec.src, false)
        : await loadImage(spec.src, false)
    } catch {
      if (!video) throw error
      console.warn('Falling back to a static illustration', spec.src, error)
      return createMask({ ...spec, src: spec.src.replace('/vid/', '/img/').replace(/\.webm$/, '.png') })
    }
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
  let pixels = new Uint8ClampedArray(sampleWidth * sampleHeight * 4)
  if (!readable) {
    pixels.fill(255)
  } else if (video) {
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
  const output = Object.fromEntries(
    (['desktop', 'mobile'] as const).map((key) => [
      key,
      config[key].map((spec, index) => {
        const edited = key === layoutKey ? editorMasks.get(index) : undefined
        return edited
          ? { ...spec, x: edited.x, top: edited.top, width: edited.width }
          : spec
      }),
    ]),
  ) as LayoutConfig
  try {
    await navigator.clipboard.writeText(JSON.stringify(output, null, 2))
    console.info(`[kodokushi editor] Updated ${layoutKey} layout copied to clipboard.`, output)
  } catch (error) {
    console.error('[kodokushi editor] Could not copy layout to clipboard.', error)
  }
}

function enableEditor(element: HTMLElement, mask: Mask, scale: number, repaint: () => void): void {
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

function mediaElement(mask: Mask, scale: number, repaint: () => void, top = mask.top * scale): HTMLElement {
  const element = mask.video ? document.createElement('video') : document.createElement('img')
  if (element instanceof HTMLVideoElement) {
    element.autoplay = true
    element.loop = true
    element.muted = true
    element.playsInline = true
  }
  element.src = mask.src
  Object.assign(element.style, {
    position: 'absolute', left: `${mask.x * scale}px`, top: `${top}px`,
    width: `${mask.width * scale}px`, height: 'auto', pointerEvents: 'none',
  })
  if (EDITOR) enableEditor(element, mask, scale, repaint)
  return element
}

async function rewrapSection(section: string, blocks: HTMLElement[], specs: IndexedSpec[]): Promise<void> {
  const blockData = blocks.map(createBlockData)
  const masks = (await Promise.allSettled(specs.map(createMask)))
    .flatMap((result) => result.status === 'fulfilled' ? [result.value] : [])
  if (!masks.length) return
  for (const mask of masks) {
    if (mask.anchor >= blockData.length)
      console.warn(`Illustration ${mask.index} targets missing block ${mask.anchor} in ${section}`)
  }
  if (EDITOR) for (const mask of masks) editorMasks.set(mask.index, mask)

  const reference = blocks.find((block) =>
    !block.matches('h1, h2, h3, h4, h5, h6, [role="heading"]'),
  ) ?? blocks[0]
  const target = document.createElement('div')
  target.className = reference.className
  target.style.cssText = reference.style.cssText
  target.style.padding = '0'
  target.style.marginTop = '0'
  target.style.marginBottom = '0'
  target.dataset.dddFlow = section
  blocks[0].before(target)
  for (const block of blocks) block.remove()

  let lastKey = ''

  const paint = () => {
    const width = target.clientWidth
    const key = `${width}`
    if ((!EDITOR && key === lastKey) || width <= 0) return
    lastKey = key
    const referenceData = blockData.find((block) => !block.heading) ?? blockData[0]
    const contentWidth = width - referenceData.pad.left - referenceData.pad.right
    const scale = contentWidth / BASE_WIDTH
    const output = document.createDocumentFragment()
    const active = new Map<Annotation, { spans: HTMLElement[]; lastY: number }>()
    const positioned: Array<{ mask: Mask; top: number }> = []
    let y = 0
    let previousMargin = 0

    for (const [blockIndex, block] of blockData.entries()) {
      y += Math.max(previousMargin, block.margin.top)
      const blockTop = y
      const blockWidth = width - block.pad.left - block.pad.right

      for (const mask of masks.filter((item) => item.anchor === blockIndex)) {
        const top = blockTop + mask.top * scale
        positioned.push({ mask, top })
        output.append(mediaElement(mask, scale, paint, top))
      }

      const shell = block.template.cloneNode(false) as HTMLElement
      Object.assign(shell.style, {
        position: 'absolute',
        top: `${blockTop}px`,
        left: '0',
        width: '100%',
        margin: '0',
        boxSizing: 'border-box',
      })
      output.append(shell)

      let localY = 0
      const data = block.prepared
      if (data) {
        let cursor: RichInlineCursor | undefined
        while (true) {
          const rowY = blockTop + block.pad.top + localY
          const blocked = positioned.flatMap(({ mask, top }) =>
            [rowY + 3, rowY + block.lineHeight / 2, rowY + block.lineHeight - 3]
              .flatMap((row) => blockedIntervals(mask, row, scale, top)),
          )
          const segments = subtractIntervals(blockWidth, blocked)
          let progressed = false
          for (const [start, end] of segments) {
            const range = layoutNextRichInlineLineRange(data, end - start, cursor)
            if (!range) continue
            progressed = true
            const line = materializeRichInlineLineRange(data, range)
            let x = block.pad.left + start
            for (const fragment of line.fragments) {
              x += fragment.gapBefore
              const item = block.content.items[fragment.itemIndex]
              const span = document.createElement('span')
              span.textContent = fragment.text
              Object.assign(span.style, { font: item.font, letterSpacing: `${item.letterSpacing ?? 0}px`, position: 'absolute', left: `${x}px`, top: `${block.pad.top + localY}px`, lineHeight: `${block.lineHeight}px`, whiteSpace: 'nowrap' })
              const annotation = block.content.annotations.get(fragment.itemIndex)
              if (annotation) {
                span.className = annotation.className
                span.style.cursor = 'pointer'
                const state = active.get(annotation) ?? { spans: [], lastY: 0 }
                state.spans.push(span)
                state.lastY = rowY + block.lineHeight
                active.set(annotation, state)
              }
              shell.append(span)
              x += fragment.occupiedWidth
            }
            cursor = line.end
          }
          if (!progressed) {
            localY += block.lineHeight
            continue
          }
          localY += block.lineHeight
          if (!layoutNextRichInlineLineRange(data, blockWidth, cursor)) break
        }
      }
      const blockHeight = block.pad.top + localY + block.pad.bottom
      shell.style.height = `${blockHeight}px`
      y = blockTop + blockHeight
      previousMargin = block.margin.bottom
    }
    y += previousMargin

    for (const [annotation, state] of active) {
      state.spans.at(-1)?.insertAdjacentHTML('beforeend', annotation.indicatorHTML)
      const popover = document.createElement('div')
      popover.className = `${annotation.contentClassName} pretext-annotation-popover`.trim()
      popover.innerHTML = annotation.contentHTML
      Object.assign(popover.style, { display: 'none', position: 'absolute', top: `${state.lastY + 4}px`, left: '0', right: '0', zIndex: '2', padding: '12px 16px', background: '#fff', border: '1px solid #ddd', boxShadow: '0 2px 8px rgba(0,0,0,.12)' })
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
    const boxHeight = Math.max(y, imageBottom)
    target.style.height = `${boxHeight}px`
    target.replaceChildren(output)
  }
  paint()
  window.addEventListener('resize', paint)
}

async function main(): Promise<void> {
  if (location.hostname === 'keystone-editor.twreporter.org') return
  window.addEventListener('resize', () => {
    if ((window.innerWidth < 768) !== mobileLayout) location.reload()
  })
  await document.fonts?.ready
  const grouped = illustrations.reduce<Record<string, IndexedSpec[]>>((result, spec) => {
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
