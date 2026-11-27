<svelte:options
  customElement={{
    tag: 'twreporter-2026-11-election-vote-city-result-map',
    props: { city: { type: 'String' } },
  }}
/>

<script lang="ts">
  import type { ComponentProps } from '@lab-reporter/ddd-shared/components/types.ts'
  import ElectionLayout from '../lib/ElectionLayout.svelte'
  import CityResultMap from './CityResultMap.svelte'

  const {
    config,
    ratio,
    city,
  }: Pick<ComponentProps, 'config' | 'ratio'> & { city?: string } = $props()
</script>

<ElectionLayout>
  <CityResultMap {config} {ratio} {city} />
</ElectionLayout>
