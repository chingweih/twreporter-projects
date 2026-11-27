<svelte:options customElement="twreporter-donor-stacked-bar" />

<script lang="ts">
  import Layout from '@lab-reporter/ddd-shared/components/shared/Layout.svelte'
  import type { ComponentProps } from '@lab-reporter/ddd-shared/components/types.ts'
  import DonorStackedBar from './DonorStackedBar.svelte'

  const { src, config, ratio }: ComponentProps = $props()
</script>

<Layout>
  <DonorStackedBar {src} {config} {ratio} />
</Layout>
