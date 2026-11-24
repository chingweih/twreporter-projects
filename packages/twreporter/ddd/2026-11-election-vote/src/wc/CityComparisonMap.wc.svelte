<svelte:options
  customElement={{
    tag: 'twreporter-2026-11-election-vote-city-comparison-map',
    props: { city: { type: 'String' } },
  }}
/>

<script lang="ts">
  import type { ComponentProps } from '@lab-reporter/ddd-shared/components/types.ts'
  import ElectionLayout from '../lib/ElectionLayout.svelte'
  import CityComparisonMap from './CityComparisonMap.svelte'

  const { config, city }: Pick<ComponentProps, 'config'> & { city?: string } =
    $props()
</script>

<ElectionLayout>
  <CityComparisonMap {config} {city} />
</ElectionLayout>
