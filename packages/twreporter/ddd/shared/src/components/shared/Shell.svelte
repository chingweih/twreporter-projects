<script lang="ts">
  import Frame from './Frame.svelte'
  import { domToBlob, domToCanvas } from 'modern-screenshot'
  import type { Snippet } from 'svelte'
  import { on } from 'svelte/events'
  import {
    collectGraphicsEvent,
    downloadBlob,
  } from '../../utils/graphic-download.ts'
  import Logo from './Logo.svelte'
  import EditableText from './EditableText.svelte'

  const ratioWidth = 700
  const bulkCanvasLimit = 2048
  let container: HTMLDivElement | undefined = $state()
  let availableWidth = $state(ratioWidth)
  let downloading = $state(false)
  let downloadError = $state(false)
  const showDownload = new URLSearchParams(window.location.search).has(
    'download',
  )

  let {
    title = $bindable(''),
    subtitle = $bindable(),
    children,
    beforeHeader,
    heading,
    topRight,
    footnotes = $bindable([]),
    readOnlyFootnotes = [],
    footnotePrefix,
    wide = false,
    backdrop = true,
    containerMinHeight,
    containerHeight,
    containerAspectRatio,
    ratio,
    editable = false,
    error,
    loading = false,
    empty = false,
    emptyMessage = '尚無資料。',
  }: {
    title?: string
    subtitle?: string
    footnotes?: string[]
    readOnlyFootnotes?: readonly string[]
    footnotePrefix?: (index: number) => string
    children?: Snippet
    beforeHeader?: Snippet
    heading?: Snippet
    topRight?: Snippet
    wide?: boolean
    backdrop?: boolean
    containerMinHeight?: number
    containerHeight?: number
    containerAspectRatio?: number
    ratio?: number
    editable?: boolean
    error?: string
    loading?: boolean
    empty?: boolean
    emptyMessage?: string
  } = $props()

  const fixedRatio = $derived(ratio !== undefined)
  const titleParts = $derived(
    title
      .split(/\r?\n/)
      .map((part) => part.trim())
      .filter(Boolean),
  )

  function observeWidth(element: HTMLDivElement) {
    availableWidth = element.clientWidth
    const observer = new ResizeObserver(([entry]) => {
      availableWidth = entry.contentRect.width
    })
    observer.observe(element)
    return () => observer.disconnect()
  }

  async function capturePng(target: HTMLDivElement, mode: 'single' | 'bulk') {
    await target.ownerDocument.fonts.ready
    const options = {
      scale: 3,
      width: fixedRatio ? ratioWidth : undefined,
      height: fixedRatio ? target.offsetHeight : undefined,
      style: fixedRatio ? { transform: 'none' } : undefined,
    }
    if (mode === 'single') return domToBlob(target, options)

    const canvas = await domToCanvas(target, {
      ...options,
      maximumCanvasSize: bulkCanvasLimit,
    })
    try {
      return await new Promise<Blob>((resolve, reject) => {
        canvas.toBlob((png) => {
          if (png) resolve(png)
          else reject(new Error('Canvas could not be encoded as PNG'))
        }, 'image/png')
      })
    } finally {
      canvas.width = 1
      canvas.height = 1
    }
  }

  function offerExport(target: HTMLDivElement) {
    return on(target.ownerDocument, collectGraphicsEvent, ({ detail }) => {
      detail.push({
        title,
        element: target,
        loading: loading && !error,
        capture: async () => {
          if (!target.isConnected || loading || error || empty) {
            throw new Error('Graphic is unavailable')
          }
          return capturePng(target, 'bulk')
        },
      })
    })
  }

  async function download() {
    const target = container
    if (!target || downloading) return
    downloading = true
    downloadError = false
    try {
      const png = await capturePng(target, 'single')
      downloadBlob(target.ownerDocument, png, `${title || '圖表'}／報導者.png`)
    } catch (cause) {
      console.error('Unable to export the graphic', cause)
      downloadError = true
    } finally {
      downloading = false
    }
  }
</script>

<div
  class={['outer', { wide, 'fixed-ratio': fixedRatio }]}
  style:--shell-ratio={ratio}
  style:--shell-width={fixedRatio ? `${ratioWidth}px` : undefined}
  style:--shell-scale={fixedRatio ? availableWidth / ratioWidth : undefined}
  {@attach fixedRatio ? observeWidth : undefined}
>
  <div
    class={['container', { backdrop }]}
    style:min-height={!fixedRatio && containerMinHeight
      ? `${containerMinHeight}px`
      : undefined}
    style:height={!fixedRatio && containerHeight
      ? `${containerHeight}px`
      : undefined}
    style:aspect-ratio={ratio ??
      (containerHeight ? undefined : containerAspectRatio)}
    bind:this={container}
    {@attach offerExport}
  >
    <Frame {beforeHeader} {topRight}>
      {#snippet topLeft()}
        <div class="header">
          {#if heading}
            <h1 class="visually-hidden">{title}</h1>
            {@render heading()}
          {:else}
            <h1>
              {#if editable}
                <EditableText bind:value={title} {editable} />
              {:else}
                {#each titleParts as part, index}
                  {#if index > 0}{' '}{/if}<span>{part}</span>
                {/each}
              {/if}
            </h1>
          {/if}
          {#if subtitle !== undefined && (editable || subtitle)}
            <p class="subtitle">
              <EditableText bind:value={subtitle} {editable} />
            </p>
          {/if}
        </div>
      {/snippet}
      {#if error}
        <p class="status error" role="alert">無法顯示圖表：{error}</p>
      {:else if loading}
        <p class="status" role="status">資料載入中……</p>
      {:else if empty}
        <p class="status" role="status">{emptyMessage}</p>
      {:else if fixedRatio || containerHeight || containerAspectRatio}
        <div class="sized-content">{@render children?.()}</div>
      {:else}
        {@render children?.()}
      {/if}
      {#snippet bottomLeft()}
        <div class="footnotes">
          {#each footnotes as _, index}
            <p>
              {footnotePrefix?.(index) ?? ''}<EditableText
                bind:value={footnotes[index]}
                {editable}
              />
            </p>
          {/each}
          {#each readOnlyFootnotes as note}
            <p>{note}</p>
          {/each}
        </div>
      {/snippet}
      {#snippet bottomRight()}
        <Logo />
      {/snippet}
    </Frame>
  </div>

  {#if showDownload}
    <div class="download-control">
      <button class="dl-button" onclick={download} disabled={downloading}
        >{downloading ? '正在匯出 PNG…' : '下載 PNG'}</button
      >
      {#if downloadError}
        <p class="status error" role="alert">無法匯出 PNG，請再試一次。</p>
      {/if}
    </div>
  {/if}
</div>

<style>
  .visually-hidden {
    position: absolute;
    width: 1px;
    height: 1px;
    overflow: hidden;
    clip-path: inset(50%);
    white-space: nowrap;
  }

  .status {
    margin: 0;
    padding: 20px 0;
    color: var(--neutral-gray-700);
    font-size: var(--text-s);
    line-height: 1.6;
  }
  .status.error {
    color: var(--chart-red-4);
  }
  .outer {
    --background: var(--neutral-gray-100);

    color: var(--text-color);
    font-family: 'Roboto Slab', 'Noto Sans TC', sans-serif;
    text-align: left;
    container-type: inline-size;
    width: 100%;
    max-width: 730px;
    margin: 60px auto;
  }

  .outer.wide {
    max-width: 1024px;
  }

  .outer.fixed-ratio {
    --text-s: var(--compact-text-s);
    --text-m: var(--compact-text-m);
    --text-l: var(--compact-text-l);
    --text-xl: var(--compact-text-xl);

    position: relative;
    overflow-x: clip;
    -webkit-text-size-adjust: 100%;
    text-size-adjust: 100%;
  }

  /* Reserve the scaled height while the chart lays out at its base width. */
  .fixed-ratio::before {
    content: '';
    display: block;
    aspect-ratio: var(--shell-ratio);
  }

  .fixed-ratio > .container {
    position: absolute;
    inset: 0 auto auto 0;
    width: var(--shell-width);
    transform: scale(var(--shell-scale));
    transform-origin: top left;
  }

  .container {
    box-sizing: border-box;
    width: 100%;
    border-top: 1px solid var(--neutral-gray-300);
    border-bottom: 1px solid var(--neutral-gray-300);
  }

  .sized-content {
    flex: 1 1 0;
    min-height: 0;
    display: flex;
    flex-direction: column;
  }
  .sized-content > :global(*) {
    flex: 1 1 0;
    min-height: 0;
  }
  .container.backdrop {
    background: var(--background);
  }

  .container :global(*) {
    box-sizing: border-box;
  }

  .header h1 {
    margin: 0;
    font-size: var(--text-xl);
    font-weight: 700;
    line-height: 1.5;
    letter-spacing: 0.01em;
    overflow-wrap: anywhere;
  }

  .header h1 > span {
    display: inline-block;
    max-width: 100%;
    white-space: normal;
  }

  .subtitle {
    margin: 0;
    color: var(--text-color);
    font-size: var(--text-l);
    font-weight: 700;
    line-height: 1.5;
    letter-spacing: 0.01em;
    overflow-wrap: anywhere;
    white-space: pre-wrap;
  }

  .footnotes {
    display: flex;
    flex-direction: column;
    gap: 5px;
  }

  .footnotes p {
    margin: 0;
    color: var(--neutral-gray-600);
    font-size: var(--text-xs);
    line-height: 1.3;
    white-space: pre-wrap;
    overflow-wrap: anywhere;
    letter-spacing: 0.01em;
  }

  .container :global(.bottom) {
    gap: 10px;
  }

  @media (min-width: 768px) {
    :where(.outer:not(.fixed-ratio)) .header h1 {
      font-size: 26px;
    }

    :where(.outer:not(.fixed-ratio)) .subtitle {
      font-size: 22px;
    }

    :where(.outer:not(.fixed-ratio)) .container :global(.frame) {
      --top: 25px;
      --left: 34px;
      --right: 34px;
      --bottom: 34px;
    }

    :where(.outer:not(.fixed-ratio)) .container :global(.logo) {
      width: 31px;
      height: 32px;
    }
  }

  .download-control {
    margin-top: 12px;
    text-align: center;
  }

  .dl-button {
    margin-top: 5px;
    padding: 5px 15px;
    border: none;
    border-radius: 40px;
    background-color: var(--neutral-gray-800);
    color: var(--neutral-white);
    cursor: pointer;
    font-size: 12px;
    letter-spacing: 0.01em;
  }
</style>
