<script lang="ts">
  import CandidateCards from './CandidateCards.svelte'
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
    container: comparison-city / inline-size;
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

  @container (width >= 1864px) {
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
</style>
