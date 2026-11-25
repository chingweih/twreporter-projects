<svelte:options
  customElement="twreporter-2026-11-election-vote-taipei-party-scatter"
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
    graphicKey="13-taipei-party-scatter"
  />
</ElectionLayout>
