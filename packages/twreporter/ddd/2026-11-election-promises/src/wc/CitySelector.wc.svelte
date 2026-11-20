<svelte:options customElement="twreporter-city-selector" />

<script lang="ts">
  import Layout from '@lab-reporter/ddd-shared/components/shared/Layout.svelte'
  import ChipSelector from '@lab-reporter/ddd-shared/components/shared/ChipSelector.svelte'
  import { citySchema } from '../lib/components/city-selector/types.ts'
  import { citySelection } from '../lib/city-selection.svelte.ts'

  const options = citySchema.options.map((value) => ({ value, label: value }))
</script>

<Layout>
  <div class="city-selector">
    <div class="intro">
      <p class="description">以下圖表將預設顯示該縣市候選人政見</p>
      <p class="question">
        選擇想看的六都縣市，看看你家市長候選人提出什麼政見？
      </p>
    </div>
    <ChipSelector
      {options}
      value={citySelection.current}
      label="縣市"
      variant="selector"
      onchange={(value) => (citySelection.current = value)}
    />
  </div>
</Layout>

<style>
  .city-selector {
    --brand-main: var(--neutral-gray-800);
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 10px;
    color: var(--neutral-gray-800);
    -webkit-font-smoothing: antialiased;
    -moz-osx-font-smoothing: grayscale;
    font-synthesis: none;
  }

  .intro {
    text-align: center;
    line-height: 1.5;
    letter-spacing: 0.01em;
  }

  p {
    margin: 0;
  }

  .description {
    color: var(--neutral-gray-500);
    font-size: 14px;
    font-weight: 400;
  }

  .question {
    font-size: 18px;
    font-weight: 500;
  }

  .city-selector :global(.chips) {
    justify-content: center;
    gap: 0;
  }

  .city-selector :global(button) {
    padding: 10px 12px;
    border-color: var(--neutral-gray-800);
    border-radius: 0;
    background: transparent;
    font-size: 16px;
    font-weight: 400;
    line-height: 1;
    letter-spacing: 0.05em;
    white-space: nowrap;
  }

  .city-selector :global(button:hover:not(.active)) {
    background: var(--neutral-gray-100);
  }
</style>
