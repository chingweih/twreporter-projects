<svelte:options
  customElement="twreporter-2026-11-election-vote-taipei-party-scatter"
/>

<script lang="ts">
  import type { ComponentProps } from '@lab-reporter/ddd-shared/components/types.ts'
  import TaipeiPartyScatter from '../lib/components/scatter-chart/TaipeiPartyScatter.svelte'
  import ElectionLayout from '../lib/ElectionLayout.svelte'

  const { config }: Pick<ComponentProps, 'config'> = $props()
</script>

<ElectionLayout>
  <TaipeiPartyScatter {config} />
</ElectionLayout>
