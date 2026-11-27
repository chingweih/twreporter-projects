<svelte:options
  customElement={{
    tag: 'twreporter-2026-11-election-vote-city-mobilization',
    props: { city: { type: 'String' } },
  }}
/>

<script lang="ts">
  import type { ComponentProps } from '@lab-reporter/ddd-shared/components/types.ts'
  import TaipeiMobilization from '../lib/components/line-chart/TaipeiMobilization.svelte'
  import ElectionLayout from '../lib/ElectionLayout.svelte'

  const {
    config,
    ratio,
    city,
  }: Pick<ComponentProps, 'config' | 'ratio'> & { city?: string } = $props()
</script>

<ElectionLayout>
  <TaipeiMobilization {config} {ratio} {city} />
</ElectionLayout>
