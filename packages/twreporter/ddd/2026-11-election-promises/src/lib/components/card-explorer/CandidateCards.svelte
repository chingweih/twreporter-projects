<script lang="ts">
  import CandidateCard from './CandidateCard.svelte'
  import type { CardExplorerConfig, Policy } from './types.ts'

  const {
    policies,
    config,
    editable,
    comparison = false,
    questionLabels,
  }: {
    policies: Policy[]
    config: CardExplorerConfig
    editable: boolean
    comparison?: boolean
    questionLabels?: ReadonlyMap<Policy['questionId'], string>
  } = $props()

  const candidates = $derived.by(() => {
    const answersByCandidate = new Map<string, Policy[]>()
    for (const policy of policies) {
      const answers = answersByCandidate.get(policy.candidate)
      if (answers) answers.push(policy)
      else answersByCandidate.set(policy.candidate, [policy])
    }
    return config.candidates
      .flatMap((candidate) => {
        const answers = answersByCandidate.get(candidate.name)
        if (!answers) return []
        return [{ candidate, answers }]
      })
      .sort(
        (a, b) =>
          (a.candidate.number ?? Infinity) - (b.candidate.number ?? Infinity),
      )
  })
</script>

<div class="candidates" class:comparison>
  {#each candidates as { candidate, answers } (candidate.name)}
    <CandidateCard
      {candidate}
      policies={answers}
      {config}
      {editable}
      {comparison}
      {questionLabels}
    />
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
