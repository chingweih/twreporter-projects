<script module lang="ts">
  import { defineMeta } from '@storybook/addon-svelte-csf'
  import type { ComponentProps } from 'svelte'
  import { fromStore, writable } from 'svelte/store'
  import FilterTabs from './FilterTabs.svelte'
  import Layout from './Layout.svelte'

  const { Story } = defineMeta({
    title: 'UI/FilterTabs',
    component: FilterTabs,
    parameters: {
      layout: 'padded',
      controls: { exclude: ['onchange', 'optionLabel'] },
    },
    render: template,
    args: {
      label: 'Topics',
      value: 'Housing',
      options: [
        'Housing',
        'Transport',
        'Education',
        'Public spaces',
        'Health',
        'Climate',
      ].map((label) => ({ label, value: label })),
    },
  })
</script>

{#snippet template(args: ComponentProps<typeof FilterTabs>)}
  {@const selection = fromStore(writable(args.value))}
  <Layout>
    <div style="max-width: 340px">
      <FilterTabs
        {...args}
        value={selection.current}
        onchange={(value) => (selection.current = value)}
      />
    </div>
  </Layout>
{/snippet}

<Story name="Scrollable topics" />
