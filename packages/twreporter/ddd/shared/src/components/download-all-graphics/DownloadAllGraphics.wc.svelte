<svelte:options customElement="twreporter-download-all-graphics" />

<script lang="ts">
  import { Zip, ZipPassThrough } from 'fflate'
  import { downloadBlob } from '../../utils/graphic-download.ts'
  import { collectPageGraphics } from './collect-page-graphics.ts'

  let progress = $state<{ completed: number; total: number }>()
  let message = $state('')

  async function download(
    event: MouseEvent & { currentTarget: HTMLButtonElement },
  ) {
    if (progress) return
    const document = event.currentTarget.ownerDocument
    message = ''
    progress = { completed: 0, total: 0 }
    try {
      const { graphics, pending } = await collectPageGraphics(document)
      if (!graphics.length) {
        message = pending
          ? '圖表尚未載入，請再試一次。'
          : '這個頁面沒有可下載的圖表。'
        return
      }

      progress.total = graphics.length
      const parts: Blob[] = []
      const zip = new Zip((error, bytes) => {
        if (error) throw error
        parts.push(new Blob([bytes]))
      })
      let exported = 0
      for (const [index, { title, capture }] of graphics.entries()) {
        let png: ArrayBuffer
        try {
          const image = await capture()
          png = await image.arrayBuffer()
        } catch (cause) {
          console.error('Unable to export graphic', title, cause)
          continue
        } finally {
          progress.completed = index + 1
        }
        const name =
          title
            .replace(/[\\/:*?"<>|\p{Cc}]/gu, ' ')
            .trim()
            .slice(0, 80) || '圖表'
        const entry = new ZipPassThrough(
          `${String(index + 1).padStart(2, '0')}-${name}.png`,
        )
        zip.add(entry)
        entry.push(new Uint8Array(png), true)
        exported += 1
      }

      if (!exported) {
        message = '無法匯出圖表，請再試一次。'
        return
      }

      zip.end()
      downloadBlob(
        document,
        new Blob(parts, { type: 'application/zip' }),
        '報導者圖表.zip',
      )
      const skipped = graphics.length - exported + pending
      if (skipped) {
        message = `已匯出 ${exported} 張圖表，${skipped} 張未能匯出。`
      }
    } catch (cause) {
      console.error('Unable to create graphics ZIP', cause)
      message = '無法匯出 ZIP，請再試一次。'
    } finally {
      progress = undefined
    }
  }
</script>

<div class="download-control">
  <button type="button" onclick={download} disabled={progress !== undefined}>
    {progress
      ? progress.total
        ? '正在匯出圖表…'
        : '正在載入圖表…'
      : '下載全部圖表（ZIP）'}
  </button>
  {#if progress}
    <div class="download-progress">
      {#if progress.total}
        <progress
          aria-label="圖表匯出進度"
          max={progress.total}
          value={progress.completed}
        ></progress>
        <span aria-hidden="true">{progress.completed} / {progress.total}</span>
      {:else}
        <progress aria-label="正在載入圖表"></progress>
      {/if}
    </div>
  {/if}
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

  .download-progress {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 8px;
    margin-top: 8px;
    font-size: 14px;
    font-variant-numeric: tabular-nums;
  }

  p {
    margin: 8px 0 0;
    font-size: 14px;
  }

  p:empty {
    margin: 0;
  }
</style>
