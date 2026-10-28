<script module lang="ts">
  import EmbedCode from '@lab-reporter/ddd-shared/components/shared/EmbedCode.svelte'
  import { defineMeta } from '@storybook/addon-svelte-csf'
  import PlayerTrackMap from './PlayerTrackMap.wc.svelte'

  const { Story } = defineMeta({
    title: 'Components/PlayerTrackMap',
    component: PlayerTrackMap,
    args: {
      src: './player-track-map.csv',
      config: './player-track-map.json',
    },
    argTypes: {
      src: { control: 'text' },
      config: { control: 'text' },
    },
  })
</script>

<Story name="Default">
  {#snippet template(args)}
    <PlayerTrackMap {...args} />
    <EmbedCode
      componentName="player-track-map"
      tagName="twreporter-2026-09-school-traffic-player-track-map"
      {...args}
    />
  {/snippet}
</Story>
