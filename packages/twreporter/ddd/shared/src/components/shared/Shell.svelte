<script lang="ts">
  import Frame from './Frame.svelte'
  import { domToPng } from 'modern-screenshot'
  import type { Snippet } from 'svelte'
  import Logo from './Logo.svelte'
  import EditableText from './EditableText.svelte'

  let container: HTMLDivElement | undefined = $state()
  const showDownload = new URLSearchParams(window.location.search).has(
    'download',
  )

  let {
    title = $bindable(''),
    subtitle = $bindable(),
    children,
    beforeHeader,
    topRight,
    footnotes = $bindable([]),
    wide = false,
    backdrop = true,
    editable = false,
    error,
    loading = false,
    empty = false,
    emptyMessage = '尚無資料。',
  }: {
    title?: string
    subtitle?: string
    footnotes?: string[]
    children?: Snippet
    beforeHeader?: Snippet
    topRight?: Snippet
    wide?: boolean
    backdrop?: boolean
    editable?: boolean
    error?: string
    loading?: boolean
    empty?: boolean
    emptyMessage?: string
  } = $props()

  async function download() {
    if (!container) return
    const dataUrl = await domToPng(container, { quality: 1, scale: 3 })
    const anchor = document.createElement('a')
    anchor.href = dataUrl
    anchor.download = `${title || '圖表'}／報導者.png`
    anchor.click()
  }
</script>

<div class={['outer', { wide }]}>
  <div class={['container', { backdrop }]} bind:this={container}>
    <Frame {beforeHeader} {topRight}>
      {#snippet topLeft()}
        <div class="header">
          <h1><EditableText bind:value={title} {editable} /></h1>
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
      {:else}
        {@render children?.()}
      {/if}
      {#snippet bottomLeft()}
        <div class="footnotes">
          {#each footnotes as _, index}
            <p><EditableText bind:value={footnotes[index]} {editable} /></p>
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
      <button class="dl-button" onclick={download}>下載 PNG</button>
    </div>
  {/if}
</div>

<style>
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

  .container {
    box-sizing: border-box;
    width: 100%;
    border-top: 1px solid var(--neutral-gray-300);
    border-bottom: 1px solid var(--neutral-gray-300);
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
    white-space: pre-wrap;
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
    .header h1 {
      font-size: 26px;
    }

    .subtitle {
      font-size: 22px;
    }

    .container :global(.frame) {
      --top: 25px;
      --left: 34px;
      --right: 34px;
      --bottom: 34px;
    }

    .container :global(.logo) {
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
