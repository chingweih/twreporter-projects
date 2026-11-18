<svelte:options customElement="twreporter-2026-11-election-promises-card-explorer" />

<script lang="ts">
  import Layout from '@lab-reporter/ddd-shared/components/shared/Layout.svelte'
  import type { ComponentProps } from '@lab-reporter/ddd-shared/components/types.ts'
  import CardExplorer from './CardExplorer.svelte'

  const { src, config }: ComponentProps = $props()
</script>

<Layout>
  <CardExplorer {src} {config} />
</Layout>
