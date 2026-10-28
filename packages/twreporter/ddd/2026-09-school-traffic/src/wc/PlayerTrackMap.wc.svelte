<svelte:options customElement="twreporter-player-track" />

<script lang="ts">
  import Layout from '@lab-reporter/ddd-shared/components/shared/Layout.svelte'
  import type { ComponentProps } from '@lab-reporter/ddd-shared/components/types.ts'
  import PlayerTrackMap from './PlayerTrackMap.svelte'

  const { config = '' }: ComponentProps = $props()
</script>

<Layout>
  <PlayerTrackMap {config} />
</Layout>
