<script lang="ts">
  import Shell from '@lab-reporter/ddd-shared/components/shared/Shell.svelte'
  import type { ComponentProps } from '@lab-reporter/ddd-shared/components/types.ts'
  import { createGraphic } from '@lab-reporter/ddd-shared/utils/graphic-data.svelte.ts'
  import { textReplace } from '@lab-reporter/ddd-shared/utils/text-replace.ts'
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
    containerMinHeight,
    autoHeight = false,
  }: Pick<ComponentProps, 'config'> & {
    batch: ElectionBatch
    graphicKey: ElectionGraphicKey
    children?: Snippet<[NonNullable<ElectionBatchConfig[ElectionGraphicKey]>]>
    error?: string
    loading?: boolean
    empty?: boolean
    wide?: boolean
    containerMinHeight?: number
    autoHeight?: boolean
  } = $props()

  const graphic = untrack(
    () =>
      getContext<ReturnType<typeof createGraphic<ElectionBatchConfig>>>(
        batch.context,
      ) ?? createGraphic(batch.name, batch.schema, () => ({ config })),
  )
  const batchConfig = $derived(graphic.config)
  const entry = $derived(batchConfig?.[graphicKey])
  const countingValues = createQuery(() => ({
    ...electionTabs.fetchLog.options,
    select: (rows) => {
      const latest = rows.at(-1)
      if (!latest) return

      const timestamp = latest.資料時間
        .trim()
        .match(/^(\d{1,2})\/(\d{1,2})\s+(\d{1,2}):(\d{2})(?::\d{2})?$/)
      if (!timestamp) return

      const [, month, day, hour, minute] = timestamp
      return {
        vMonth: String(Number(month)),
        vDay: String(Number(day)),
        vHour: hour.padStart(2, '0'),
        vMin: minute,
        vProgress: String(latest['開票完成率(%)']),
      }
    },
  }))
  const sharedTemplates = $derived(
    batchConfig?.sharedFootnote.filter(
      (note) =>
        note.trim() &&
        (countingValues.data ||
          !/\{\{v(?:Month|Day|Hour|Min|Progress)\}\}/.test(note)),
    ) ?? [],
  )
  const localNoteCount = $derived(entry?.footnotes.length ?? 0)
  const numberFootnotes = $derived(localNoteCount + sharedTemplates.length > 2)
  const sharedNotes = $derived(
    sharedTemplates.map((note, index) =>
      textReplace(note, {
        ...countingValues.data,
        vIndex: numberFootnotes ? String(localNoteCount + index + 1) : '',
      }),
    ),
  )
</script>

{#if batchConfig && entry}
  <Shell
    bind:title={entry.title}
    bind:footnotes={entry.footnotes}
    readOnlyFootnotes={sharedNotes}
    footnotePrefix={(index) => `註${numberFootnotes ? index + 1 : ''}：`}
    {wide}
    {containerMinHeight}
    containerHeight={autoHeight ? undefined : entry.containerHeight}
    containerAspectRatio={autoHeight ? undefined : entry.containerAspectRatio}
    editable={graphic.editable}
    error={graphic.error ?? error}
    {loading}
    empty={empty ?? !children}
  >
    {@render children?.(entry)}
  </Shell>
{:else}
  <Shell
    {wide}
    error={graphic.error ?? (batchConfig && `找不到圖表設定 ${graphicKey}。`)}
    loading={graphic.loading}
    empty
  />
{/if}
