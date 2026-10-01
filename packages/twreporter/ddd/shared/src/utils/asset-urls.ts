import type { ComponentProps } from '../components/types.ts'

export function generateAssetUrls(
  componentName: string,
  attributes: ComponentProps,
  tagName = `twreporter-${componentName}`,
) {
  const timestamp =
    import.meta.env.VITE_BUILD_TIMESTAMP ?? '<version-timestamp>'
  const scriptPath = `components/${componentName}/${componentName}-${timestamp}.js`
  const scriptUrl = new URL(
    import.meta.env.DEV ? `/dist/${scriptPath}` : `../${scriptPath}`,
    window.location.href,
  ).href

  const schemaPath = `components/${componentName}/${componentName}-${timestamp}.schema.json`
  const schemaUrl = new URL(
    import.meta.env.DEV ? `/dist/${schemaPath}` : `../${schemaPath}`,
    window.location.href,
  ).href
  const serializedAttributes = Object.entries(attributes)
    .map(([name, value]) => {
      const url = value ? new URL(value, document.baseURI).href : ''
      const escaped = url
        .replace(/&/g, '&amp;')
        .replace(/"/g, '&quot;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
      return `  ${name}="${escaped}"`
    })
    .join('\n')
  return {
    embedCode: [
      `<script type="module" src="${scriptUrl}"></script>`,
      '<link rel="stylesheet" href="https://projects.twreporter.org/twreporter/ddd/shared/embed.css">',
      '<div class="embed-code-container">',
      `<${tagName}\n${serializedAttributes}\n></${tagName}>`,
      '</div>',
    ].join('\n'),
    schemaUrl,
  }
}
