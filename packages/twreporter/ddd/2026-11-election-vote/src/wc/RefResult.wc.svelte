<svelte:options customElement="twreporter-2026-11-election-vote-ref-result" />

<script lang="ts">
  import type { ComponentProps } from '@lab-reporter/ddd-shared/components/types.ts'
  import RefResult from '../lib/components/bar-chart/RefResult.svelte'
  import ElectionLayout from '../lib/ElectionLayout.svelte'

  const { config, ratio }: Pick<ComponentProps, 'config' | 'ratio'> = $props()
</script>

<ElectionLayout>
  <RefResult {config} {ratio} />
</ElectionLayout>
