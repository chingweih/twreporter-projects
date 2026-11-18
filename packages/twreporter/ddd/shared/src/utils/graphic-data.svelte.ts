import { createQuery } from '@tanstack/svelte-query'
import Papa from 'papaparse'
import { untrack } from 'svelte'
import type { ZodType } from 'zod'
import type { ComponentProps } from '../components/types.ts'
import { fetchJson, fetchText, parseCsv, type CSVData } from './fetchers.ts'
import { syncGraphic, type GraphicSources } from './graphic-sync.svelte.ts'

type GraphicDataProps = Pick<ComponentProps, 'config'> & {
  src?: ComponentProps['src']
  sources?: Record<string, string>
}
type GraphicSource = CSVData & Pick<GraphicSources[number], 'id'>

export function createGraphic<Config>(
  name: string,
  configSchema: ZodType<Config>,
  props: () => GraphicDataProps,
) {
  const editorMode =
    window.parent !== window &&
    new URLSearchParams(window.location.search).has('edit')
  let config: Config | undefined = $state()
  let sources: GraphicSource[] | undefined = $state()
  let sourceError: string | undefined = $state()

  const sync = syncGraphic(configSchema, {
    config: {
      get: () => config,
      set: (value) => {
        config = value
      },
    },
    sources: {
      get: () =>
        sources?.map(({ id, headers, rows }) => ({
          id,
          data: Papa.unparse({ fields: headers, data: rows }),
        })),
      set: (value) => {
        try {
          sources = value.map(({ id, data }) => ({ id, ...parseCsv(data) }))
          sourceError = undefined
        } catch (error) {
          sources = undefined
          sourceError =
            error instanceof Error ? error.message : 'Unable to read CSV data'
        }
      },
    },
  })

  const query = createQuery(() => ({
    queryKey: [name, props()] as const,
    enabled: !editorMode && !sync.connected && Boolean(props().config),
    queryFn: async ({ signal }) => {
      const urls = props()
      const sourceUrls = urls.sources ?? (urls.src ? { source: urls.src } : {})
      const [sources, config] = await Promise.all([
        Promise.all(
          Object.entries(sourceUrls).map(async ([id, url]) => ({
            id,
            ...parseCsv(
              await fetchText(new URL(url, document.baseURI).href, signal),
            ),
          })),
        ),
        fetchJson(
          new URL(urls.config, document.baseURI).href,
          configSchema,
          signal,
        ),
      ])
      return { sources, config }
    },
  }))

  $effect(() => {
    if (sync.connected) return
    const data = query.data
    untrack(() => {
      config = data ? structuredClone(data.config) : undefined
      sources = data ? structuredClone(data.sources) : undefined
      sourceError = undefined
    })
  })

  return {
    get config() {
      return config
    },
    get csv() {
      return sources?.[0]
    },
    get sources() {
      return sources
    },
    get editable() {
      return sync.editable
    },
    get loading() {
      return query.isFetching || (editorMode && !sync.connected)
    },
    get error() {
      return sourceError ?? query.error?.message
    },
  }
}
