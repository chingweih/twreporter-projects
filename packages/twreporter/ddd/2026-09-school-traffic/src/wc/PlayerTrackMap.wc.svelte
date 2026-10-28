<svelte:options customElement="twreporter-2026-09-school-traffic-player-track-map" />

<script lang="ts">
  import Layout from '@lab-reporter/ddd-shared/components/shared/Layout.svelte'
  import type { ComponentProps } from '@lab-reporter/ddd-shared/components/types.ts'
  import PlayerTrackMap from './PlayerTrackMap.svelte'

  const { src, config }: ComponentProps = $props()
</script>

<Layout>
  <PlayerTrackMap {src} {config} />
</Layout>
