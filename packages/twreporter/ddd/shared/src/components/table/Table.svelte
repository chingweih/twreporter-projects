<script lang="ts">
  import { resolveShellRatio } from '../../utils/shell-ratio.ts'
  import { createGraphic } from '../../utils/graphic-data.svelte.ts'
  import type { ComponentProps } from '../types.ts'
  import Shell from '../shared/Shell.svelte'
  import ScrollFade from '../shared/ScrollFade.svelte'
  import EditableText from '../shared/EditableText.svelte'
  import { tableConfigSchema } from './types.ts'
  import { requireCsvColumns } from '../../utils/fetchers.ts'

  const props: ComponentProps = $props()
  const graphic = createGraphic(
    'twreporter-table',
    tableConfigSchema,
    () => props,
  )
  const config = $derived(graphic.config)
  const csv = $derived(graphic.csv)
  const table = $derived.by(() => {
    if (!csv || !config) return { rows: undefined, error: undefined }
    try {
      requireCsvColumns(
        csv,
        config.columns.map((column) => column.key),
      )
      return { rows: csv.rows, error: undefined }
    } catch (error) {
      return {
        rows: undefined,
        error: error instanceof Error ? error.message : '資料格式錯誤。',
      }
    }
  })
</script>

{#if config && table.rows}
  <Shell
    bind:title={config.title}
    bind:footnotes={config.footnotes}
    wide={config.wide}
    backdrop={config.backdrop}
    ratio={resolveShellRatio(props.ratio, config.ratio)}
    editable={graphic.editable}
    empty={!table.rows.length}
  >
    <div class="table-group">
      {#if config.label !== undefined}
        <div class="table-label">
          <EditableText bind:value={config.label} editable={graphic.editable} />
        </div>
      {/if}
      <ScrollFade>
        <table style:--mobile-width={(config.mobileWidth ?? 100) + '%'}>
          <colgroup>
            {#each config.columns as column}
              <col
                style:width={column.width === undefined
                  ? undefined
                  : column.width * 100 + '%'}
              />
            {/each}
          </colgroup>
          <thead>
            <tr>
              {#each config.columns as column}
                <th style:text-align={column.align ?? 'left'}
                  ><EditableText
                    bind:value={column.label}
                    editable={graphic.editable}
                  /></th
                >
              {/each}
            </tr>
          </thead>
          <tbody>
            {#each table.rows as row}
              <tr>
                {#each config.columns as column}
                  <td style:text-align={column.align ?? 'left'}
                    ><EditableText
                      editable={graphic.editable}
                      bind:value={
                        () => row[column.key] ?? '—',
                        (value) => {
                          row[column.key] = value ?? ''
                        }
                      }
                    /></td
                  >
                {/each}
              </tr>
            {/each}
          </tbody>
        </table>
      </ScrollFade>
    </div>
  </Shell>
{:else}
  <Shell error={table.error ?? graphic.error} loading={graphic.loading} empty />
{/if}

<style>
  .table-group {
    min-width: 0;
  }

  .table-label {
    padding: 6px;
    border: 1px solid var(--neutral-gray-200);
    border-radius: 2px 2px 0 0;
    background-color: var(--neutral-gray-200);
    color: var(--neutral-gray-800);
    font-size: var(--text-m);
    font-weight: 700;
    text-align: center !important;
  }

  table {
    width: 100%;
    min-height: 60px;
    border: 1px solid var(--neutral-gray-200);
    border-radius: 2px;
    border-collapse: collapse;
    font-size: var(--text-m);
    table-layout: fixed;
  }

  thead tr {
    border-bottom: 1px solid var(--neutral-gray-200);
    background-color: var(--neutral-gray-100);
  }

  tbody tr {
    border-bottom: 1px solid var(--neutral-gray-200);
  }

  tbody tr:last-child {
    border-bottom: none;
  }

  tbody tr:hover td {
    background-color: var(--neutral-white);
  }

  th,
  td {
    padding: 10px 12px;
    border-right: 1px solid var(--neutral-gray-200);
    vertical-align: middle;
  }

  th:last-child,
  td:last-child {
    border-right: none;
  }

  th {
    color: var(--neutral-gray-100);
    font-weight: 500;
    white-space: auto;
    background-color: var(--chart-red-4);
  }

  td {
    color: var(--neutral-gray-800);
    white-space: pre-line;
  }

  @media (max-width: 767px) {
    table {
      width: var(--mobile-width);
      min-width: 100%;
    }

    th,
    td {
      padding: 6px 8px;
    }
  }
</style>
