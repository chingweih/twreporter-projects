<script module lang="ts">
  import EmbedCode from '@lab-reporter/ddd-shared/components/shared/EmbedCode.svelte'
  import { defineMeta } from '@storybook/addon-svelte-csf'
  import CitySelector from './CitySelector.wc.svelte'

  const { Story } = defineMeta({
    title: 'Components/CitySelector',
    component: CitySelector,
  })
</script>

<Story name="Default">
  <CitySelector />
  <EmbedCode
    componentName="city-selector"
    tagName="twreporter-city-selector"
    config=""
  />
</Story>
