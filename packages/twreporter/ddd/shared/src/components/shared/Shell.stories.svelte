<script module lang="ts">
  import { defineMeta } from '@storybook/addon-svelte-csf'
  import type { ComponentProps } from 'svelte'
  import { fromStore, writable } from 'svelte/store'
  import Layout from './Layout.svelte'
  import Shell from './Shell.svelte'

  const { Story } = defineMeta({
    title: 'Layout/Shell',
    component: Shell,
    parameters: {
      controls: {
        include: [
          'title',
          'subtitle',
          'editable',
          'wide',
          'backdrop',
          'ratio',
          'loading',
          'error',
          'empty',
        ],
      },
    },
    render: template,
    args: {
      title: 'Library visits',
      subtitle: 'August 2026',
      footnotes: ['Counts include all visits.'],
      readOnlyFootnotes: ['Source: Branch attendance records'],
    },
  })
</script>

{#snippet template(args: ComponentProps<typeof Shell>)}
  {@const footnotes = fromStore(writable([...(args.footnotes ?? [])]))}
  <Layout>
    <Shell {...args} bind:footnotes={footnotes.current}>
      <p>790 visits across two branches.</p>
    </Shell>
  </Layout>
{/snippet}

<Story name="Default" />
<Story name="FixedRatio" args={{ ratio: 0.8 }} />
<Story name="Editable" args={{ editable: true }} />
<Story name="Loading" args={{ loading: true }} />
<Story name="Error" args={{ error: 'Unable to load attendance records.' }} />
<Story name="Empty" args={{ empty: true }} />
