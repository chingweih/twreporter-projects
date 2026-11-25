<script module lang="ts">
  import type { ComponentProps } from 'svelte'
  import { defineMeta } from '@storybook/addon-svelte-csf'
  import TextDiff from './TextDiff.svelte'
  import { fontStylesheetUrl } from '../../utils/fonts'

  const { Story } = defineMeta({
    title: 'UI/TextDiff',
    component: TextDiff,
    parameters: { layout: 'padded' },
    render: template,
    args: {
      brief:
        '臺北市社會住宅興辦總量已達36,974戶。近4年已新增盤點7,041戶潛力基地，未來將持續擴大社宅供給。',
      full: '臺北市持續朝社會住宅5萬戶的政策目標邁進。截至115年9月底，臺北市社會住宅興辦總量已達36,974戶。面對臺北市土地資源有限的挑戰，市府積極盤點公有土地、閒置及低度利用的公有房舍，評估興辦社會住宅的可行性。近4年已新增盤點7,041戶潛力基地，未來將持續推動，逐步擴大社宅供給。',
      showFull: false,
    },
    argTypes: {
      brief: { control: 'text' },
      full: { control: 'text' },
      showFull: { control: 'boolean' },
    },
  })
</script>

<svelte:head>
  <link rel="stylesheet" href={fontStylesheetUrl} />
</svelte:head>

{#snippet template(args: ComponentProps<typeof TextDiff>)}
  <TextDiff lineHeight={1.6} letterSpacing={0} {...args} />
{/snippet}

<Story name="Default" />

<Story name="Full text" args={{ showFull: true }} />

<Story
  name="Unchanged"
  args={{
    brief: '市議會通過公園興建計畫。',
    full: '市議會通過公園興建計畫。',
  }}
/>

<Story
  name="Addition"
  args={{
    brief: '市議會通過公園興建計畫。',
    full: '市議會通過河濱公園興建計畫。',
  }}
/>

<Story
  name="Removal"
  args={{
    brief: '市議會通過河濱公園興建計畫。',
    full: '市議會通過公園興建計畫。',
  }}
/>

<Story name="Empty brief" args={{ brief: '' }} />

<Story name="Empty full" args={{ full: '' }} />

<Story name="Empty text" args={{ brief: '', full: '' }} />

<Story
  name="Multiline"
  args={{
    brief: '市議會通過公園興建計畫。\n工程預計六月動工。',
    full: '市議會通過河濱公園興建計畫。\n工程預計七月動工。\n公園預計明年春天開放。',
  }}
/>
