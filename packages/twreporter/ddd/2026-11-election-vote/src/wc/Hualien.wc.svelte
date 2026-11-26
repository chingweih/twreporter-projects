<svelte:options customElement="twreporter-2026-11-election-vote-hualien" />

<script lang="ts">
  import type { ComponentProps } from '@lab-reporter/ddd-shared/components/types.ts'
  import Hualien from '../lib/components/line-chart/Hualien.svelte'
  import ElectionLayout from '../lib/ElectionLayout.svelte'

  const { config }: Pick<ComponentProps, 'config'> = $props()
</script>

<ElectionLayout>
  <Hualien {config} />
</ElectionLayout>
