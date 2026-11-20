<script lang="ts">
  import type { ComponentProps } from '@lab-reporter/ddd-shared/components/types.ts'
  import Shell from '@lab-reporter/ddd-shared/components/shared/Shell.svelte'
  import { createGraphic } from '@lab-reporter/ddd-shared/utils/graphic-data.svelte.ts'
  import { mayorMapConfigSchema } from '../lib/components/mayor-map/types.ts'

  const props: ComponentProps = $props()
  const graphic = createGraphic(
    'twreporter-2026-11-election-vote-mayor-map',
    mayorMapConfigSchema,
    () => props,
  )
  const config = $derived(graphic.config)
  const csv = $derived(graphic.csv)
</script>

{#if config && csv}
  <Shell
    bind:title={config.title}
    bind:subtitle={config.subtitle}
    bind:footnotes={config.footnotes}
    wide={config.wide}
    backdrop={config.backdrop}
    editable={graphic.editable}
    empty
  />
{:else}
  <Shell error={graphic.error} loading={graphic.loading} empty />
{/if}
