<svelte:options customElement="twreporter-2026-11-election-vote-city-grid" />

<script lang="ts">
  import type { ComponentProps } from '@lab-reporter/ddd-shared/components/types.ts'
  import CityGrid from './CityGrid.svelte'
  import ElectionLayout from '../lib/ElectionLayout.svelte'

  const { config }: Pick<ComponentProps, 'config'> = $props()
</script>

<ElectionLayout>
  <CityGrid {config} />
</ElectionLayout>
