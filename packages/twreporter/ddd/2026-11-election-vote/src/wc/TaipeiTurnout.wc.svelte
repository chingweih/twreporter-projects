<svelte:options
  customElement="twreporter-2026-11-election-vote-taipei-turnout"
/>

<script lang="ts">
  import type { ComponentProps } from '@lab-reporter/ddd-shared/components/types.ts'
  import CityTurnout from './CityTurnout.svelte'
  import ElectionLayout from '../lib/ElectionLayout.svelte'

  const { config }: Pick<ComponentProps, 'config'> = $props()
</script>

<ElectionLayout>
  <CityTurnout {config} taipei />
</ElectionLayout>
