<script lang="ts" generics="Config">
  import { setContext, untrack, type Snippet } from 'svelte'
  import type { ZodType } from 'zod'
  import {
    createGraphic,
    type GraphicDataProps,
  } from '../../utils/graphic-data.svelte.ts'

  const {
    name,
    schema,
    context,
    config,
    src,
    sources,
    children,
  }: GraphicDataProps & {
    name: string
    schema: ZodType<Config>
    context: symbol
    children: Snippet<[ReturnType<typeof createGraphic<Config>>]>
  } = $props()
  const graphic = untrack(() =>
    createGraphic(name, schema, () => ({ config, src, sources })),
  )
  untrack(() => setContext(context, graphic))
</script>

{@render children(graphic)}
