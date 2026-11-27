<script module lang="ts">
  import { defineMeta } from '@storybook/addon-svelte-csf'
  import EmbedCode from '../shared/EmbedCode.svelte'
  import Layout from '../shared/Layout.svelte'
  import Shell from '../shared/Shell.svelte'
  import './DownloadAllGraphics.wc.svelte'
  import { downloadAllGraphicsConfig } from './types.ts'

  const { Story } = defineMeta({
    title: 'Components/DownloadAllGraphics',
  })
</script>

<Story name="Default">
  <Layout>
    <twreporter-download-all-graphics></twreporter-download-all-graphics>
    <Shell title="圖表 A">
      <p>第一張圖表</p>
    </Shell>
    <Shell title="圖表 B">
      <p>第二張圖表</p>
    </Shell>
    <EmbedCode
      componentName="download-all-graphics"
      version={downloadAllGraphicsConfig.version}
      config=""
    />
  </Layout>
</Story>
