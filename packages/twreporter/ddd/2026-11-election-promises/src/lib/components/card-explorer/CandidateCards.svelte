<script lang="ts">
  import type { Snippet } from 'svelte'
  import CandidateCard from './CandidateCard.svelte'
  import type { CardExplorerConfig, Policy } from './types.ts'

  const {
    policies,
    config,
    editable,
    comparison = false,
    footnotes,
    questionLabels,
  }: {
    policies: Policy[]
    config: CardExplorerConfig
    editable: boolean
    comparison?: boolean
    footnotes?: Snippet
    questionLabels?: ReadonlyMap<Policy['questionId'], string>
  } = $props()

  const candidateNames = $derived([
    ...new Set(policies.map((policy) => policy.candidate)),
  ])
</script>

<div class="candidates" class:comparison>
  {#each candidateNames as name (name)}
    {@const candidate = config.candidates.find((item) => item.name === name)}
    {#if candidate}
      <CandidateCard
        {candidate}
        policies={policies.filter((policy) => policy.candidate === name)}
        {config}
        {editable}
        {comparison}
        {footnotes}
        {questionLabels}
      />
    {/if}
  {/each}
</div>

<style>
  .candidates {
    display: grid;
    grid-template-columns: repeat(2, minmax(0, 1fr));
    gap: 40px;
    min-width: 0;
  }

  .comparison {
    grid-template-columns: minmax(0, 1fr);
    padding-block: 10px 20px;
  }

  @container comparison-city (width >= 840px) {
    .comparison {
      grid-template-columns: repeat(2, minmax(0, 1fr));
    }

    .comparison > :global(.candidate:nth-child(even)) {
      position: relative;
    }

    .comparison > :global(.candidate:nth-child(even))::before {
      position: absolute;
      inset: 0 auto 0 -20px;
      border-inline-start: 1px solid var(--neutral-gray-300);
      content: '';
    }
  }

  @media (width < 768px) {
    .candidates {
      grid-template-columns: minmax(0, 1fr);
      gap: 25px;
    }
  }
</style>
