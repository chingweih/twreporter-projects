<svelte:options customElement={{ tag: 'twreporter-full-screen-wrapper' }} />

<script lang="ts">
  import { onMount } from 'svelte'
  import { listenForMessages } from '../../utils/post-message.ts'
  import Layout from '../shared/Layout.svelte'
  import type { ComponentPropsWithChildren } from '../types'
  import FullScreenWrapper from './FullScreenWrapper.svelte'
  import { fullScreenWrapperMessageSchema } from './types'

  const { src, config, children }: ComponentPropsWithChildren = $props()
  let wrapper: ReturnType<typeof FullScreenWrapper>

  onMount(() => {
    const host = $host()
    return listenForMessages({
      schema: fullScreenWrapperMessageSchema,
      accepts: (event) =>
        event.source !== null &&
        Array.from(host.querySelectorAll('iframe')).some(
          (iframe) => event.source === iframe.contentWindow,
        ),
      onMessage: (message) => wrapper.handleMessage(message),
    })
  })
</script>

<Layout>
  <FullScreenWrapper bind:this={wrapper} {src} {config}>
    <div style:display="contents">
      <slot />
    </div>
  </FullScreenWrapper>
</Layout>
