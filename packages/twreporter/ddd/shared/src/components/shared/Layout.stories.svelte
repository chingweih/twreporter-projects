<script module lang="ts">
  import { defineMeta } from '@storybook/addon-svelte-csf'
  import Layout from './Layout.svelte'
  import Legend from './Legend.svelte'
  import Shell from './Shell.svelte'

  const { Story } = defineMeta({
    title: 'Layout/Layout',
    component: Layout,
    parameters: {
      layout: 'padded',
      controls: { exclude: ['children', 'hideInEditor'] },
    },
  })
</script>

<Story name="Typography and colors">
  {#snippet template()}
    <Layout>
      <Shell title="Library visits" subtitle="August 2026">
        <p>790 visits across two branches.</p>
        <Legend
          items={[
            { label: 'Central', color: 'var(--chart-blue-3)' },
            { label: 'East', color: 'var(--chart-mint-3)' },
          ]}
        />
      </Shell>
    </Layout>
  {/snippet}
</Story>
