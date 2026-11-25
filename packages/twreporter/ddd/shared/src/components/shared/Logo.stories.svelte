<script module lang="ts">
  import { defineMeta } from '@storybook/addon-svelte-csf'
  import Logo from './Logo.svelte'

  const { Story } = defineMeta({
    title: 'Layout/Logo',
    component: Logo,
    parameters: { layout: 'padded' },
  })
</script>

<Story name="Default" />
