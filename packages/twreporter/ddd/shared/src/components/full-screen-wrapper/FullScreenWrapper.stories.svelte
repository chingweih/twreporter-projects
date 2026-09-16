<script module lang="ts">
  import { defineMeta } from '@storybook/addon-svelte-csf'
  import { generateEmbedCode } from '../../storybook/generate-embed-code'
  import FullScreenWrapper from './FullScreenWrapper.wc.svelte'
  import EmbedCode from '../../storybook/EmbedCode.svelte'
  import type { FullScreenWrapperConfig } from './types'

  const { Story } = defineMeta({
    title: 'Components/FullScreenWrapper',
    component: FullScreenWrapper,
    args: {
      src: '',
      config: JSON.stringify({
        splashScreenText: '你即將進入3D體驗',
      } satisfies FullScreenWrapperConfig),
    },
  })
</script>

<Story name="Default">
  {#snippet template({ children, ...args })}
    <div
      style:width="100%"
      style:height="500px"
      style:display="flex"
      style:align-items="center"
      style:justify-content="center"
    >
      空內容
    </div>
    <FullScreenWrapper {...args}>
      <iframe
        src="https://playcanv.as/e/p/pfFdufj4/"
        title="報導者"
        width="100%"
        height="100%"
      ></iframe>
    </FullScreenWrapper>
    <div
      style:width="100%"
      style:height="500px"
      style:display="flex"
      style:align-items="center"
      style:justify-content="center"
    >
      空內容
    </div>
    <EmbedCode code={generateEmbedCode('full-screen-wrapper', args)} />
  {/snippet}
</Story>
