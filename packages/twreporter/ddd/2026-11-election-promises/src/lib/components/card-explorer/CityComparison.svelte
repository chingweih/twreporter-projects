<script lang="ts">
  import CandidateCards from './CandidateCards.svelte'
  import { compactComparison, mobile } from './media-query.ts'
  import type { CardExplorerConfig, Policy } from './types.ts'

  const {
    policies,
    config,
    editable,
    questionLabels,
  }: {
    policies: Policy[]
    config: CardExplorerConfig
    editable: boolean
    questionLabels: ReadonlyMap<Policy['questionId'], string>
  } = $props()

  const cities = $derived([...new Set(policies.map((policy) => policy.city))])
</script>

<div class="cities">
  {#each cities as city (city)}
    <section class="comparison-city">
      <h2>{city}</h2>
      <CandidateCards
        policies={policies.filter((policy) => policy.city === city)}
        {config}
        {editable}
        {questionLabels}
        banner={compactComparison.current}
        popover={!mobile.current && !editable}
        comparison
      />
    </section>
  {/each}
</div>

<style>
  .cities {
    position: relative;
    display: grid;
    min-width: 0;
    grid-template-columns: minmax(0, 1fr);
  }

  .comparison-city {
    display: grid;
    grid-template-rows: auto 1fr;
    min-width: 0;
    border-block-end: 1px solid var(--neutral-gray-500);
  }

  .comparison-city:first-child {
    border-block-start: 1px solid var(--neutral-gray-500);
  }

  h2 {
    margin: 0;
    padding: 10px 12px;
    border-block-end: 1px solid var(--neutral-gray-300);
    font-family: 'Noto Sans TC', sans-serif;
    font-size: 20px;
    font-weight: 600;
    line-height: 1;
    letter-spacing: 1px;
    text-align: center;
  }

  @media (width >= 768px) {
    .cities {
      grid-template-columns: repeat(2, minmax(0, 1fr));
      column-gap: 80px;
    }

    .cities:has(.comparison-city:nth-child(2))::before {
      position: absolute;
      inset: 0 50% 0 auto;
      border-inline-start: 1px solid var(--neutral-gray-500);
      content: '';
    }

    .comparison-city:nth-child(2) {
      border-block-start: 1px solid var(--neutral-gray-500);
    }
  }

  @media (768px <= width < 1080px) {
    .cities {
      column-gap: 40px;
    }
  }
</style>
