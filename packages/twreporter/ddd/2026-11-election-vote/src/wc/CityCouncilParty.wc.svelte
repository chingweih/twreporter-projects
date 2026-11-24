<svelte:options
  customElement="twreporter-2026-11-election-vote-city-council-party"
/>

<script lang="ts">
  import type { ComponentProps } from '@lab-reporter/ddd-shared/components/types.ts'
  import { secondBatch } from '../lib/batches/second.ts'
  import ElectionGraphic from '../lib/ElectionGraphic.svelte'
  import ElectionLayout from '../lib/ElectionLayout.svelte'

  const { config }: Pick<ComponentProps, 'config'> = $props()
</script>

<ElectionLayout>
  <ElectionGraphic
    batch={secondBatch}
    {config}
    graphicKey="4-city-council-party"
  />
</ElectionLayout>
