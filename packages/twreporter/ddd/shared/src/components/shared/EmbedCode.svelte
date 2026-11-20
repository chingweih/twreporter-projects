<script lang="ts">
  import { generateAssetUrls } from '../../utils/asset-urls.ts'
  import type {
    ComponentAttributes,
    ComponentExtraProps,
    ComponentProps,
  } from '../types.ts'
  import TextAreaCopy from './TextAreaCopy.svelte'

  const {
    componentName,
    tagName,
    previewStoryId,
    src,
    config,
    sources,
    extraProps = {},
  }: Pick<ComponentProps, 'config'> &
    Partial<Pick<ComponentProps, 'src'>> & {
      componentName: string
      tagName?: string
      previewStoryId?: string
      sources?: Record<string, string>
      extraProps?: ComponentExtraProps
    } = $props()
  const attributes = $derived.by(() => {
    const props: ComponentAttributes = { ...extraProps, config }
    if (sources) {
      props.sources = JSON.stringify(
        Object.fromEntries(
          Object.entries(sources).map(([id, url]) => [
            id,
            new URL(url, document.baseURI).href,
          ]),
        ),
      )
    } else if (src !== undefined) {
      props.src = src
    }
    return props
  })
  const { embedCode, schemaUrl, storybookIFrameUrl } = $derived(
    generateAssetUrls(componentName, attributes, tagName, previewStoryId),
  )
</script>

<div class="embed-code-container">
  <TextAreaCopy code={embedCode} label="Embed Code" />
  <TextAreaCopy code={schemaUrl} label="Schema URL" />
  <TextAreaCopy code={storybookIFrameUrl} label="Preview iFrame URL" />
</div>

<style>
  .embed-code-container {
    margin-top: 5px;
    padding: 30px 0;
    border-top: 1px #888 solid;
    display: flex;
    align-items: center;
    justify-content: center;
    width: 100%;
    gap: 10px;
    flex-wrap: wrap;
  }
</style>
