<script lang="ts">
  import type { ComponentProps } from 'svelte'
  import ChipSelector from './ChipSelector.svelte'
  import ScrollFade from './ScrollFade.svelte'

  const {
    class: className = '',
    ...props
  }: Pick<
    ComponentProps<typeof ChipSelector>,
    'options' | 'value' | 'label' | 'onchange' | 'optionLabel'
  > & { class?: string } = $props()
</script>

<div class={['filter-tabs', className]}>
  <ScrollFade><ChipSelector {...props} variant="selector" /></ScrollFade>
</div>

<style>
  .filter-tabs {
    min-width: 0;
  }
  .filter-tabs :global(.chips) {
    flex-wrap: nowrap;
    align-items: center;
    min-width: max-content;
  }
  .filter-tabs :global(button) {
    flex-shrink: 0;
  }
</style>
