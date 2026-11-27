<svelte:options customElement="twreporter-download-all-graphics" />

<script lang="ts">
  import { zipSync, type Zippable } from 'fflate'
  import {
    collectGraphicsEvent,
    downloadBlob,
    type GraphicExport,
  } from '../../utils/graphic-download.ts'

  let downloading = $state(false)
  let message = $state('')

  async function download(
    event: MouseEvent & { currentTarget: HTMLButtonElement },
  ) {
    const document = event.currentTarget.ownerDocument
    const graphics: GraphicExport[] = []
    document.dispatchEvent(
      new CustomEvent(collectGraphicsEvent, { detail: graphics }),
    )
    message = ''
    if (!graphics.length) {
      message = '這個頁面沒有可下載的圖表。'
      return
    }

    downloading = true
    const files: Zippable = {}
    let exported = 0
    try {
      for (const [index, { title, capture }] of graphics.entries()) {
        try {
          const png = await capture()
          const name =
            title
              .replace(/[\\/:*?"<>|\p{Cc}]/gu, ' ')
              .trim()
              .slice(0, 80) || '圖表'
          files[`${String(index + 1).padStart(2, '0')}-${name}.png`] =
            new Uint8Array(await png.arrayBuffer())
          exported += 1
        } catch (cause) {
          console.error('Unable to export graphic', title, cause)
        }
      }

      if (!exported) {
        message = '無法匯出圖表，請再試一次。'
        return
      }

      const zip = zipSync(files, { level: 0 })
      downloadBlob(
        document,
        new Blob([zip], { type: 'application/zip' }),
        '報導者圖表.zip',
      )
      if (exported < graphics.length) {
        message = `已匯出 ${exported} 張圖表，${graphics.length - exported} 張匯出失敗。`
      }
    } catch (cause) {
      console.error('Unable to create graphics ZIP', cause)
      message = '無法匯出 ZIP，請再試一次。'
    } finally {
      downloading = false
    }
  }
</script>

<div class="download-control">
  <button type="button" onclick={download} disabled={downloading}>
    {downloading ? '正在匯出圖表…' : '下載全部圖表（ZIP）'}
  </button>
  <p role="status">{message}</p>
</div>

<style>
  .download-control {
    margin-block: 12px;
    text-align: center;
  }

  button {
    padding: 8px 16px;
    border: 0;
    border-radius: 40px;
    background: var(--neutral-gray-800, #383838);
    color: var(--neutral-white, white);
    cursor: pointer;
    font: inherit;
    font-size: 14px;
  }

  button:disabled {
    cursor: wait;
  }

  p {
    margin: 8px 0 0;
    font-size: 14px;
  }

  p:empty {
    margin: 0;
  }
</style>
