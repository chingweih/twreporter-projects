<svelte:options
  customElement="twreporter-2026-11-election-vote-party-city-result"
/>

<script lang="ts">
  import type { ComponentProps } from '@lab-reporter/ddd-shared/components/types.ts'
  import PartyCityResult from './PartyCityResult.svelte'
  import ElectionLayout from '../lib/ElectionLayout.svelte'

  const { config }: Pick<ComponentProps, 'config'> = $props()
</script>

<ElectionLayout>
  <PartyCityResult {config} />
</ElectionLayout>
