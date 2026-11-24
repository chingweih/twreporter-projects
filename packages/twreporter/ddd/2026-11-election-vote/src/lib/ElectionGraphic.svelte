<script lang="ts">
  import Shell from '@lab-reporter/ddd-shared/components/shared/Shell.svelte'
  import type { ComponentProps } from '@lab-reporter/ddd-shared/components/types.ts'
  import { createGraphic } from '@lab-reporter/ddd-shared/utils/graphic-data.svelte.ts'
  import { createQuery } from '@tanstack/svelte-query'
  import { getContext, untrack, type Snippet } from 'svelte'
  import type {
    ElectionBatch,
    ElectionBatchConfig,
    ElectionGraphicKey,
  } from './batch-config.ts'
  import { electionTabs } from './election-data.ts'

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
  const countingFootnote = createQuery(() => ({
    ...electionTabs.fetchLog.options,
    select: (rows) => {
      const latest = rows.at(-1)
      if (!latest) return

      const timestamp = latest.資料時間
        .trim()
        .match(/^(\d{1,2})\/(\d{1,2})\s+(\d{1,2}):(\d{2})(?::\d{2})?$/)
      if (!timestamp) return

      const [, month, day, hour, minute] = timestamp
      const progress = latest['開票完成率(%)']
      return `本表統計截至${Number(month)}月${Number(day)}日${hour.padStart(2, '0')}時${minute}分（開票進度${progress}％），最終票數以中選會公告為準`
    },
  }))
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
  const countingNoteCount = $derived(countingFootnote.data ? 1 : 0)
  const numberFootnotes = $derived(footnotes.length + countingNoteCount > 2)

  function notePrefix(index: number) {
    return `註${numberFootnotes ? index + 1 : ''}：`
  }
</script>

{#if batchConfig && entry}
  <Shell
    bind:title={entry.title}
    {footnotes}
    readOnlyFootnote={countingFootnote.data &&
      notePrefix(0) + countingFootnote.data}
    footnotePrefix={(index) =>
      index < entry.footnotes.length
        ? notePrefix(index + countingNoteCount)
        : ''}
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
    {wide}
    error={graphic.error ?? (batchConfig && `找不到圖表設定 ${graphicKey}。`)}
    loading={graphic.loading}
    empty
  />
{/if}
