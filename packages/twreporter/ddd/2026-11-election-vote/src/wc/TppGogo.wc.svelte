<svelte:options customElement="twreporter-2026-11-election-vote-tpp-gogo" />

<script lang="ts">
  import type { ComponentProps } from '@lab-reporter/ddd-shared/components/types.ts'
  import TppGogo from '../lib/components/nomination-units/TppGogo.svelte'
  import ElectionLayout from '../lib/ElectionLayout.svelte'

  const { config, ratio }: Pick<ComponentProps, 'config' | 'ratio'> = $props()
</script>

<ElectionLayout>
  <TppGogo {config} {ratio} />
</ElectionLayout>
