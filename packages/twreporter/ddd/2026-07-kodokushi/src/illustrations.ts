import illustrationData from './illustrations.json'
import { createElement } from './lib/dom'

const ALPHA_THRESHOLD = 32
const IMAGE_PADDING = 20
const EDITOR_Z_INDEX = '2147483647'
const WEBM_TYPE = 'video/webm; codecs="vp9"'
export const MOBILE_BREAKPOINT = 768
export const EDITOR_MODE = location.hash === '#editor'
export const INITIAL_MOBILE_LAYOUT = window.innerWidth < MOBILE_BREAKPOINT
const IOS =
  /iPad|iPhone|iPod/.test(navigator.userAgent) ||
  (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1)
const USE_WEBM =
  !IOS && createElement('video').canPlayType(WEBM_TYPE) !== ''

export type IllustrationSpec = {
  target: string
  anchor: number
  src: string
  x: number
  top: number
  width: number
}

export type IndexedSpec = IllustrationSpec & {
  index: number
  source: IllustrationSpec
}

export type IllustrationMask = IndexedSpec & {
  pixels: Uint8ClampedArray
  sampleWidth: number
  sampleHeight: number
  video: boolean
}

type LayoutKey = 'desktop' | 'mobile'

const config = illustrationData
const layoutKey: LayoutKey = INITIAL_MOBILE_LAYOUT ? 'mobile' : 'desktop'

export const illustrations: IndexedSpec[] = config[layoutKey].map(
  (spec, index) => ({
    ...spec,
    index,
    source: spec,
  }),
)

function loadImage(src: string, cors = true): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const image = new Image()
    if (cors) image.crossOrigin = 'anonymous'
    image.onload = () => resolve(image)
    image.onerror = reject
    image.src = src
  })
}

function staticImageSrc(src: string): string {
  return src.replace('/vid/', '/img/').replace(/\.webm$/, '.png')
}

function readFrame(
  context: CanvasRenderingContext2D,
  source: CanvasImageSource,
  width: number,
  height: number,
): Uint8ClampedArray | null {
  try {
    context.drawImage(source, 0, 0, width, height)
    return context.getImageData(0, 0, width, height).data
  } catch {
    // Safari may load cross-origin media successfully but still taint the canvas.
    return null
  }
}

export async function createMask(
  spec: IndexedSpec,
): Promise<IllustrationMask> {
  const animated = spec.src.endsWith('.webm')
  const maskSrc = animated ? staticImageSrc(spec.src) : spec.src
  let source: HTMLImageElement
  let readable = true
  try {
    source = await loadImage(maskSrc)
  } catch (error) {
    readable = false
    try {
      source = await loadImage(maskSrc, false)
    } catch {
      throw error
    }
  }

  const sampleWidth = 480
  const sampleHeight = Math.round((source.height / source.width) * sampleWidth)
  const canvas = createElement('canvas', {
    width: sampleWidth,
    height: sampleHeight,
  })
  const context = canvas.getContext('2d', { willReadFrequently: true })
  if (!context) throw new Error('Canvas is unavailable')

  const pixels = new Uint8ClampedArray(sampleWidth * sampleHeight * 4)
  if (!readable) {
    pixels.fill(255)
  } else {
    const frame = readFrame(context, source, sampleWidth, sampleHeight)
    if (frame) pixels.set(frame)
    else pixels.fill(255)
  }
  return {
    ...spec,
    ...(animated && !USE_WEBM ? { src: maskSrc } : {}),
    pixels,
    sampleWidth,
    sampleHeight,
    video: animated && USE_WEBM,
  }
}

export function blockedIntervals(
  mask: IllustrationMask,
  y: number,
  scale: number,
  top = mask.top * scale,
): [number, number][] {
  const width = mask.width * scale
  const pixelScale = width / mask.sampleWidth
  const row = Math.floor((y - top) / pixelScale)
  if (row < 0 || row >= mask.sampleHeight) return []

  const intervals: [number, number][] = []
  let start: number | null = null
  for (let column = 0; column < mask.sampleWidth; column += 1) {
    const alpha = mask.pixels[(row * mask.sampleWidth + column) * 4 + 3]
    if (alpha > ALPHA_THRESHOLD && start === null) start = column
    if (
      (alpha <= ALPHA_THRESHOLD || column === mask.sampleWidth - 1) &&
      start !== null
    ) {
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

async function copyConfigToClipboard(): Promise<void> {
  try {
    await navigator.clipboard.writeText(JSON.stringify(config, null, 2))
    console.info(
      `[kodokushi editor] Updated ${layoutKey} layout copied to clipboard.`,
      config,
    )
  } catch (error) {
    console.error(
      '[kodokushi editor] Could not copy layout to clipboard.',
      error,
    )
  }
}

function enableEditor(
  element: HTMLElement,
  mask: IllustrationMask,
  scale: number,
  repaint: () => void,
): void {
  element.title = 'Drag to move; Shift-drag to resize'
  Object.assign(element.style, {
    pointerEvents: 'auto',
    cursor: 'move',
    outline: '1px dashed #e60000',
    zIndex: EDITOR_Z_INDEX,
  })
  element.addEventListener('pointerdown', (event) => {
    event.preventDefault()
    const start = {
      clientX: event.clientX,
      clientY: event.clientY,
      x: mask.x,
      top: mask.top,
      width: mask.width,
    }
    const resize = event.shiftKey
    const move = (next: PointerEvent) => {
      const dx = (next.clientX - start.clientX) / scale
      const dy = (next.clientY - start.clientY) / scale
      if (resize) mask.width = Math.max(50, Math.round(start.width + dx))
      else {
        mask.x = Math.round(start.x + dx)
        mask.top = Math.round(start.top + dy)
      }
      Object.assign(mask.source, {
        x: mask.x,
        top: mask.top,
        width: mask.width,
      })
      repaint()
    }
    const stop = () => {
      window.removeEventListener('pointermove', move)
      void copyConfigToClipboard()
    }
    window.addEventListener('pointermove', move)
    window.addEventListener('pointerup', stop, { once: true })
  })
}

export function createMediaElement(
  mask: IllustrationMask,
  scale: number,
  repaint: () => void,
  top = mask.top * scale,
): HTMLElement {
  const style = {
    position: 'absolute',
    left: `${mask.x * scale}px`,
    top: `${top}px`,
    width: `${mask.width * scale}px`,
    height: 'auto',
    pointerEvents: 'none',
  } satisfies Partial<CSSStyleDeclaration>
  const element = mask.video
    ? createElement('video', {
        src: mask.src,
        poster: staticImageSrc(mask.src),
        autoplay: true,
        loop: true,
        muted: true,
        playsInline: true,
        style,
      })
    : createElement('img', { src: mask.src, style })

  if (EDITOR_MODE) enableEditor(element, mask, scale, repaint)
  return element
}
