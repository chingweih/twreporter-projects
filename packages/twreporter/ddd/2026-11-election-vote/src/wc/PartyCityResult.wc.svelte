<svelte:options
  customElement="twreporter-2026-11-election-vote-party-city-result"
/>

<script lang="ts">
  import type { ComponentProps } from '@lab-reporter/ddd-shared/components/types.ts'
  import { firstBatch } from '../lib/batches/first.ts'
  import ElectionGraphic from '../lib/ElectionGraphic.svelte'
  import ElectionLayout from '../lib/ElectionLayout.svelte'

  const { config }: Pick<ComponentProps, 'config'> = $props()
</script>

<ElectionLayout>
  <ElectionGraphic
    batch={firstBatch}
    {config}
    graphicKey="3-party-city-result"
  />
</ElectionLayout>
