<svelte:options customElement="twreporter-2026-11-election-vote-mayor-map" />

<script lang="ts">
  import Layout from '@lab-reporter/ddd-shared/components/shared/Layout.svelte'
  import type { ComponentProps } from '@lab-reporter/ddd-shared/components/types.ts'
  import MayorMap from './MayorMap.svelte'

  const { src, config }: ComponentProps = $props()
</script>

<Layout>
  <MayorMap {src} {config} />
</Layout>
