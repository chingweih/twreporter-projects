<script lang="ts">
  import Shell from '@lab-reporter/ddd-shared/components/shared/Shell.svelte'
  import type { ComponentProps } from '@lab-reporter/ddd-shared/components/types.ts'
  import type { Snippet } from 'svelte'
  import type { ElectionBatch } from './batch-config.ts'
  import ElectionGraphic from './ElectionGraphic.svelte'

  const {
    batch,
    name,
    config,
    city,
    wide,
    fitViewport = false,
    children,
  }: Pick<ComponentProps, 'config'> & {
    batch: ElectionBatch
    name: string
    city?: string
    wide?: boolean
    fitViewport?: boolean
    children?: Snippet<[string]>
  } = $props()

  const entry = $derived(
    batch.graphics.find(
      (graphic) => graphic.name === name && graphic.city === city,
    ),
  )
</script>

<div class="city-graphic" class:fit-viewport={fitViewport}>
  {#if entry?.city}
    <ElectionGraphic
      {batch}
      {config}
      {wide}
      graphicKey={entry.key}
      empty={!children}
    >
      {@render children?.(entry.city)}
    </ElectionGraphic>
  {:else}
    <Shell
      {wide}
      error={`找不到 ${name}（縣市代碼：${city || '未提供'}）的圖表設定。`}
    />
  {/if}
</div>

<style>
  .city-graphic {
    display: contents;
  }

  .fit-viewport :global(.outer > .container) {
    display: grid;
    grid-template-rows: minmax(0, 1fr);
    max-height: 100dvh;
  }

  .fit-viewport :global(.frame) {
    overflow: auto;
  }
</style>
