<svelte:options
  customElement="twreporter-2026-11-election-vote-party-city-result"
/>

<script lang="ts">
  import type { ComponentProps } from '@lab-reporter/ddd-shared/components/types.ts'
  import PartyCityResult from '../lib/components/bar-chart/PartyCityResult.svelte'
  import ElectionLayout from '../lib/ElectionLayout.svelte'

  const { config, ratio }: Pick<ComponentProps, 'config' | 'ratio'> = $props()
</script>

<ElectionLayout>
  <PartyCityResult {config} {ratio} />
</ElectionLayout>
