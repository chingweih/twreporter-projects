import type { ComponentAttributes } from '../components/types.ts'
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
) {
  const timestamp =
    import.meta.env.VITE_BUILD_TIMESTAMP ?? '<version-timestamp>'

  return {
    embedCode: [
      `<script type="module" src="${getDistUrl(`components/${componentName}/${componentName}-${timestamp}.js`)}"></script>`,
      '<link rel="stylesheet" href="https://projects.twreporter.org/twreporter/ddd/shared/embed.css">',
      '<div class="embed-code-container">',
      `<${tagName}\n${serializeHTMLAttr(attributes)}\n></${tagName}>`,
      '</div>',
    ].join('\n'),
    schemaUrl: getDistUrl(
      `components/${componentName}/${componentName}-${timestamp}.schema.json`,
    ),
    storybookIFrameUrl: getDistUrl(
      `storybook/iframe.html?id=${previewStoryId}&viewMode=story`,
    ),
  }
}
