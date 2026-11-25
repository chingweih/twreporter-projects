<script module lang="ts">
  import { defineMeta } from '@storybook/addon-svelte-csf'
  import type { ComponentProps } from 'svelte'
  import { fromStore, writable } from 'svelte/store'
  import EditableText from './EditableText.svelte'
  import Layout from './Layout.svelte'

  const { Story } = defineMeta({
    title: 'Editor/EditableText',
    component: EditableText,
    parameters: { layout: 'padded' },
    render: template,
    args: {
      value: 'Library visits',
      placeholder: 'Enter a title',
      editable: false,
    },
  })
</script>

{#snippet template(args: ComponentProps<typeof EditableText>)}
  {@const text = fromStore(writable(args.value))}
  <Layout>
    <EditableText {...args} bind:value={text.current} />
  </Layout>
{/snippet}

<Story name="Read only" />
<Story name="Editable" args={{ editable: true }} />
<Story name="Placeholder" args={{ value: '', editable: true }} />
