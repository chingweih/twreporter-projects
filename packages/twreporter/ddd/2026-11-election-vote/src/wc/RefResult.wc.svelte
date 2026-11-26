<svelte:options customElement="twreporter-2026-11-election-vote-ref-result" />

<script lang="ts">
  import type { ComponentProps } from '@lab-reporter/ddd-shared/components/types.ts'
  import RefResult from '../lib/components/bar-chart/RefResult.svelte'
  import ElectionLayout from '../lib/ElectionLayout.svelte'

  const { config }: Pick<ComponentProps, 'config'> = $props()
</script>

<ElectionLayout>
  <RefResult {config} />
</ElectionLayout>
