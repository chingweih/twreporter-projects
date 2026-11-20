<svelte:options customElement="twreporter-2026-11-election-vote-mayor-map" />

<script lang="ts">
  import type { ComponentProps } from '@lab-reporter/ddd-shared/components/types.ts'
  import ElectionLayout from '../lib/ElectionLayout.svelte'
  import MayorMap from './MayorMap.svelte'

  const { src, config }: ComponentProps = $props()
</script>

<ElectionLayout>
  <MayorMap {src} {config} />
</ElectionLayout>
