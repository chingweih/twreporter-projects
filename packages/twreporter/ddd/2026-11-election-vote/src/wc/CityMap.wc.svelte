<svelte:options customElement="twreporter-2026-11-election-vote-city-map" />

<script lang="ts">
  import type { ComponentProps } from '@lab-reporter/ddd-shared/components/types.ts'
  import ElectionLayout from '../lib/ElectionLayout.svelte'
  import CityMap from './CityMap.svelte'

  const { config, ratio }: Pick<ComponentProps, 'config' | 'ratio'> = $props()
</script>

<ElectionLayout>
  <CityMap {config} {ratio} />
</ElectionLayout>
