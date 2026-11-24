<svelte:options
  customElement={{
    tag: 'twreporter-2026-11-election-vote-city-mobilization',
    props: { city: { type: 'String' } },
  }}
/>

<script lang="ts">
  import type { ComponentProps } from '@lab-reporter/ddd-shared/components/types.ts'
  import { secondBatch } from '../lib/batches/second.ts'
  import ElectionCityGraphic from '../lib/ElectionCityGraphic.svelte'
  import ElectionLayout from '../lib/ElectionLayout.svelte'

  const { config, city }: Pick<ComponentProps, 'config'> & { city?: string } =
    $props()
</script>

<ElectionLayout>
  <ElectionCityGraphic
    batch={secondBatch}
    name="city-mobilization"
    {config}
    {city}
  />
</ElectionLayout>
