<script module lang="ts">
  import { defineMeta } from '@storybook/addon-svelte-csf'
  import type { ComponentProps } from 'svelte'
  import TextAreaCopy from './TextAreaCopy.svelte'

  const { Story } = defineMeta({
    title: 'Editor/TextAreaCopy',
    component: TextAreaCopy,
    parameters: { layout: 'padded' },
    render: template,
    args: {
      label: 'Attendance CSV',
      code: 'branch,visits\nCentral,480\nEast,310',
    },
  })
</script>

{#snippet template(args: ComponentProps<typeof TextAreaCopy>)}
  <TextAreaCopy {...args} />
{/snippet}

<Story name="Copy CSV" />
