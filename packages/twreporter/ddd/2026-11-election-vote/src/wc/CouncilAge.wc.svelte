<svelte:options customElement="twreporter-2026-11-election-vote-council-age" />

<script lang="ts">
  import type { ComponentProps } from '@lab-reporter/ddd-shared/components/types.ts'
  import CouncilChart from './CouncilChart.svelte'
  import ElectionLayout from '../lib/ElectionLayout.svelte'
  const { config }: Pick<ComponentProps, 'config'> = $props()
</script>

<ElectionLayout><CouncilChart {config} kind="age" /></ElectionLayout>
