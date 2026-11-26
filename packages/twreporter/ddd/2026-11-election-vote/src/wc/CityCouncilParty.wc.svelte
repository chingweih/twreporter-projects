<svelte:options
  customElement="twreporter-2026-11-election-vote-city-council-party"
/>

<script lang="ts">
  import type { ComponentProps } from '@lab-reporter/ddd-shared/components/types.ts'
  import CouncilChart from '../lib/components/bar-chart/CouncilChart.svelte'
  import ElectionLayout from '../lib/ElectionLayout.svelte'
  const { config }: Pick<ComponentProps, 'config'> = $props()
</script>

<ElectionLayout><CouncilChart {config} kind="party" /></ElectionLayout>
