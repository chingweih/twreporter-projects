<svelte:options customElement={{ tag: 'twreporter-full-screen-wrapper' }} />

<script lang="ts">
  import Layout from '../shared/Layout.svelte'
  import type { ComponentPropsWithChildren } from '../types'
  import FullScreenWrapper from './FullScreenWrapper.svelte'

  const { src, config, children }: ComponentPropsWithChildren = $props()
</script>

<Layout>
  <FullScreenWrapper {src} {config}>
    <div style:display="contents">
      <slot />
    </div>
  </FullScreenWrapper>
</Layout>
