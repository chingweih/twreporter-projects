<svelte:options customElement="twreporter-2026-11-election-vote-council-sex" />

<script lang="ts">
  import type { ComponentProps } from '@lab-reporter/ddd-shared/components/types.ts'
  import CouncilChart from '../lib/components/bar-chart/CouncilChart.svelte'
  import ElectionLayout from '../lib/ElectionLayout.svelte'
  const { config, ratio }: Pick<ComponentProps, 'config' | 'ratio'> = $props()
</script>

<ElectionLayout><CouncilChart {config} {ratio} kind="sex" /></ElectionLayout>
