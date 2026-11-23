<script lang="ts" generics="Config">
  import { setContext, untrack, type Snippet } from 'svelte'
  import type { ZodType } from 'zod'
  import {
    createGraphic,
    type GraphicDataProps,
    type GraphicQueryOptions,
  } from '../../utils/graphic-data.svelte.ts'

  const {
    name,
    schema,
    context,
    config,
    src,
    sources,
    queryOptions,
    children,
  }: GraphicDataProps & {
    name: string
    schema: ZodType<Config>
    context: symbol
    queryOptions?: GraphicQueryOptions
    children: Snippet<[ReturnType<typeof createGraphic<Config>>]>
  } = $props()
  const graphic = untrack(() =>
    setContext(
      context,
      createGraphic(
        name,
        schema,
        () => ({ config, src, sources }),
        queryOptions,
      ),
    ),
  )
</script>

{@render children(graphic)}
