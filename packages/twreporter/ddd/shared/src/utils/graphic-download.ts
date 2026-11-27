export const collectGraphicsEvent = 'twreporter:collect-graphics'

export type GraphicExport = {
  title: string
  capture: () => Promise<Blob>
}

declare global {
  interface DocumentEventMap {
    [collectGraphicsEvent]: CustomEvent<GraphicExport[]>
  }
}

export function downloadBlob(document: Document, blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob)
  try {
    const anchor = document.createElement('a')
    anchor.href = url
    anchor.download = filename
    anchor.click()
  } finally {
    setTimeout(() => URL.revokeObjectURL(url), 1000)
  }
}
