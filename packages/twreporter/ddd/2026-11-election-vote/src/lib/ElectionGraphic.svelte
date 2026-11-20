<script lang="ts">
  import Shell from '@lab-reporter/ddd-shared/components/shared/Shell.svelte'
  import type { ComponentProps } from '@lab-reporter/ddd-shared/components/types.ts'
  import { createGraphic } from '@lab-reporter/ddd-shared/utils/graphic-data.svelte.ts'
  import { getContext, untrack, type Snippet } from 'svelte'
  import type {
    ElectionBatch,
    ElectionBatchConfig,
    ElectionGraphicKey,
  } from './batch-config.ts'

  const {
    config,
    batch,
    graphicKey,
    children,
    error,
    loading,
    empty,
    wide,
  }: Pick<ComponentProps, 'config'> & {
    batch: ElectionBatch
    graphicKey: ElectionGraphicKey
    children?: Snippet
    error?: string
    loading?: boolean
    empty?: boolean
    wide?: boolean
  } = $props()

  const graphic = untrack(
    () =>
      getContext<ReturnType<typeof createGraphic<ElectionBatchConfig>>>(
        batch.context,
      ) ?? createGraphic(batch.name, batch.schema, () => ({ config })),
  )
  const batchConfig = $derived(graphic.config)
  const entry = $derived(batchConfig?.[graphicKey])
  const footnotes = $derived.by(() => {
    const config = batchConfig
    if (!entry || !config) return []

    const localFootnotes = entry.footnotes
    const notes: string[] = []
    // Shell edits by index, so each line writes back to its config field.
    for (const index of localFootnotes.keys()) {
      Object.defineProperty(notes, index, {
        get: () => localFootnotes[index],
        set: (text: string) => {
          localFootnotes[index] = text
        },
      })
    }
    if (config.sharedFootnote || graphic.editable) {
      Object.defineProperty(notes, notes.length, {
        get: () => config.sharedFootnote,
        set: (text: string) => {
          config.sharedFootnote = text
        },
      })
    }
    return notes
  })
</script>

{#if batchConfig && entry}
  <Shell
    bind:title={entry.title}
    {footnotes}
    {wide}
    editable={graphic.editable}
    error={graphic.error ?? error}
    {loading}
    empty={empty ?? !children}
  >
    {@render children?.()}
  </Shell>
{:else}
  <Shell
    error={graphic.error ?? (batchConfig && `找不到圖表設定 ${graphicKey}。`)}
    loading={graphic.loading}
    empty
  />
{/if}
