import type { ComponentAttributes } from '../components/types.ts'
import { withComponentVersion } from './component-name.ts'
import { serializeHTMLAttr } from './html.ts'

function getDistUrl(path: string) {
  return new URL(
    import.meta.env.DEV ? `/dist/${path}` : `../${path}`,
    window.location.href,
  ).href
}

export function generateAssetUrls(
  componentName: string,
  attributes: ComponentAttributes,
  tagName = `twreporter-${componentName}`,
  previewStoryId = `components-${componentName.replaceAll('-', '')}--default`,
  version?: number,
) {
  const timestamp =
    import.meta.env.VITE_BUILD_TIMESTAMP ?? '<version-timestamp>'

  const directory = `components/${withComponentVersion(componentName, version)}`
  const versioned = version !== undefined
  const previewQuery = `?id=${previewStoryId}&viewMode=story`
  const script = versioned ? 'embed.js' : `${componentName}-${timestamp}.js`
  const schema = versioned
    ? 'schema.json'
    : `${componentName}-${timestamp}.schema.json`

  return {
    embedCode: [
      `<script type="module" src="${getDistUrl(`${directory}/${script}`)}"></script>`,
      '<link rel="stylesheet" href="https://projects.twreporter.org/twreporter/ddd/shared/embed.css">',
      '<div class="embed-code-container">',
      `<${tagName}\n${serializeHTMLAttr(attributes)}\n></${tagName}>`,
      '</div>',
    ].join('\n'),
    schemaUrl: getDistUrl(`${directory}/${schema}`),
    storybookIFrameUrl: new URL(
      `iframe.html${previewQuery}`,
      window.location.href,
    ).href,
  }
}
