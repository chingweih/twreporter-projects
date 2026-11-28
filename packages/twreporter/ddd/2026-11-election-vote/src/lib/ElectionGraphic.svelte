<script lang="ts">
  import { resolveShellRatio } from '@lab-reporter/ddd-shared/utils/shell-ratio.ts'
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
  import { historicalElectionTabs } from './election-historical-data.ts'
  import { resolvePartyColor } from './party-colors.ts'

  const {
    config,
    ratio,
    batch,
    graphicKey,
    children,
    error,
    loading,
    empty,
    wide,
    containerMinHeight,
    autoHeight = false,
  }: Pick<ComponentProps, 'config' | 'ratio'> & {
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
  let width = $state(0)
  const mobileHeight = $derived(
    width > 0 && width <= 580 ? entry?.mobileContainerHeight : undefined,
  )
  const responsiveEntry = $derived.by(() => {
    if (!entry) return
    if (mobileHeight !== undefined) {
      return {
        ...entry,
        ratio: undefined,
        containerHeight: mobileHeight,
        containerAspectRatio: undefined,
      }
    }

    const effectiveRatio = resolveShellRatio(ratio, entry.ratio)
    if (effectiveRatio !== entry.ratio)
      return { ...entry, ratio: effectiveRatio }
    if (effectiveRatio === undefined && width > 0 && width <= 580) {
      return { ...entry, containerAspectRatio: undefined }
    }
    return entry
  })
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
        vProgress: latest['開票完成率(%)'].text,
      }
    },
  }))
  const footnoteTemplates = $derived(
    [...(entry?.footnotes ?? []), ...(batchConfig?.sharedFootnote ?? [])].join(
      '\n',
    ),
  )
  const mayorNoteValues = createQuery(() => ({
    ...historicalElectionTabs.mayorWinners.options,
    enabled: /\{\{self(?:KMT|DPP)\}\}/.test(footnoteTemplates),
    select: (rows) => {
      const declaredParties = rows
        .filter((row) => row.自行宣布當選.trim() === '*' && row.當選人.trim())
        .map((row) => resolvePartyColor(row.政黨).label)
      return {
        selfKMT: String(
          declaredParties.filter((party) => party === '中國國民黨').length,
        ),
        selfDPP: String(
          declaredParties.filter((party) => party === '民主進步黨').length,
        ),
      }
    },
  }))
  const councilNoteValues = createQuery(() => ({
    ...electionTabs.councilors.options,
    enabled: footnoteTemplates.includes('{{women}}'),
    select: (rows) => ({
      women: String(
        rows.filter(
          (row) =>
            row.性別.trim() === '女' &&
            row.婦女保障當選.trim() === '婦女保障當選',
        ).length,
      ),
    }),
  }))
  const noteValues = $derived({
    ...countingValues.data,
    ...mayorNoteValues.data,
    ...councilNoteValues.data,
  })

  function resolveFootnotes(notes: string[]) {
    return notes
      .map((note) => textReplace(note, noteValues))
      .filter(
        (note) =>
          !/\{\{(?:v(?:Month|Day|Hour|Min|Progress)|selfKMT|selfDPP|women)\}\}/.test(
            note,
          ),
      )
  }

  const localNotes = $derived(
    graphic.editable
      ? (entry?.footnotes ?? [])
      : resolveFootnotes(entry?.footnotes ?? []),
  )
  const sharedTemplates = $derived(
    resolveFootnotes(batchConfig?.sharedFootnote ?? []).filter((note) =>
      note.trim(),
    ),
  )
  const localNoteCount = $derived(localNotes.length)
  const numberFootnotes = $derived(localNoteCount + sharedTemplates.length > 2)
  const sharedNotes = $derived(
    sharedTemplates.map((note, index) =>
      textReplace(note, {
        vIndex: numberFootnotes ? String(localNoteCount + index + 1) : '',
      }),
    ),
  )
</script>

<div
  bind:clientWidth={width}
  style:--legend-align={entry?.legendAlign === 'left'
    ? 'flex-start'
    : entry?.legendAlign === 'right'
      ? 'flex-end'
      : 'center'}
>
  {#if batchConfig && entry && responsiveEntry}
    <Shell
      bind:title={entry.title}
      bind:footnotes={
        () => localNotes,
        (notes) => {
          entry.footnotes = notes
        }
      }
      readOnlyFootnotes={sharedNotes}
      footnotePrefix={(index) => `註${numberFootnotes ? index + 1 : ''}：`}
      {wide}
      {containerMinHeight}
      ratio={responsiveEntry.ratio}
      containerHeight={autoHeight && mobileHeight === undefined
        ? undefined
        : responsiveEntry.containerHeight}
      containerAspectRatio={autoHeight
        ? undefined
        : responsiveEntry.containerAspectRatio}
      editable={graphic.editable}
      error={graphic.error ?? error}
      {loading}
      empty={empty ?? !children}
    >
      {@render children?.(responsiveEntry)}
    </Shell>
  {:else}
    <Shell
      {wide}
      error={graphic.error ?? (batchConfig && `找不到圖表設定 ${graphicKey}。`)}
      loading={graphic.loading}
      empty
    />
  {/if}
</div>
