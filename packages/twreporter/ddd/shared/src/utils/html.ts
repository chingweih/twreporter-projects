import type { ComponentAttributes } from '../components/types.ts'

export function serializeHTMLAttr(attributes: ComponentAttributes) {
  return Object.entries(attributes)
    .map(([name, value]) => {
      const text =
        (name === 'src' || name === 'config') && value
          ? new URL(String(value), document.baseURI).href
          : String(value)
      const escaped = text
        .replace(/&/g, '&amp;')
        .replace(/"/g, '&quot;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
      return `  ${name}="${escaped}"`
    })
    .join('\n')
}
