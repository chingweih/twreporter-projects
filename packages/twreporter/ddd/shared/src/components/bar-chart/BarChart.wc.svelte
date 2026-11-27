<svelte:options customElement="twreporter-bar-chart" />

<script lang="ts">
  import Layout from '../shared/Layout.svelte'
  import type { ComponentProps } from '../types.ts'
  import BarChartGraphic from './BarChartGraphic.svelte'

  const { src, config, ratio }: ComponentProps = $props()
</script>

<Layout>
  <BarChartGraphic {src} {config} {ratio} />
</Layout>
