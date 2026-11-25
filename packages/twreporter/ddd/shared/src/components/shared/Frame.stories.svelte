<script module lang="ts">
  import { defineMeta } from '@storybook/addon-svelte-csf'
  import Frame from './Frame.svelte'
  import Layout from './Layout.svelte'
  import Logo from './Logo.svelte'

  const { Story } = defineMeta({
    title: 'Layout/Frame',
    component: Frame,
    parameters: { layout: 'padded' },
  })
</script>

<Story name="Header and footer">
  {#snippet template()}
    <Layout>
      <div style="max-width: 730px; background: var(--neutral-gray-100)">
        <Frame>
          {#snippet topLeft()}<h2>Library visits</h2>{/snippet}
          {#snippet topRight()}<p>August 2026</p>{/snippet}
          <p>790 visits across two branches.</p>
          {#snippet bottomLeft()}<small>Source: Branch attendance records</small
            >{/snippet}
          {#snippet bottomRight()}<Logo />{/snippet}
        </Frame>
      </div>
    </Layout>
  {/snippet}
</Story>
