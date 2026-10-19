<script module lang="ts">
  import { defineMeta } from '@storybook/addon-svelte-csf'
  import FullScreenWrapper from './FullScreenWrapper.wc.svelte'
  import EmbedCode from '../shared/EmbedCode.svelte'
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
      空內容（往下滑看到元件）
    </div>
    <FullScreenWrapper {...args}>
      <iframe
        src="https://playcanv.as/e/p/02007016/"
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
      空內容（往上滑看到元件）
    </div>
    <EmbedCode
      componentName="full-screen-wrapper"
      tagName="twreporter-full-screen-wrapper"
      {...args}
    />
  {/snippet}
</Story>
