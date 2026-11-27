<svelte:options
  customElement="twreporter-2026-11-election-vote-taipei-turnout"
/>

<script lang="ts">
  import type { ComponentProps } from '@lab-reporter/ddd-shared/components/types.ts'
  import CityTurnout from '../lib/components/line-chart/CityTurnout.svelte'
  import ElectionLayout from '../lib/ElectionLayout.svelte'

  const { config, ratio }: Pick<ComponentProps, 'config' | 'ratio'> = $props()
</script>

<ElectionLayout>
  <CityTurnout {config} {ratio} taipei />
</ElectionLayout>
