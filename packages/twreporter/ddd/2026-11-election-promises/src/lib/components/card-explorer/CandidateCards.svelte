<script lang="ts">
  import { tick } from 'svelte'
  import CandidateCard from './CandidateCard.svelte'
  import { narrowComparison } from './media-query.ts'
  import type { CardExplorerConfig, Policy } from './types.ts'

  const {
    policies,
    config,
    editable,
    comparison = false,
    banner = false,
    popover = false,
    questionLabels,
  }: {
    policies: Policy[]
    config: CardExplorerConfig
    editable: boolean
    comparison?: boolean
    banner?: boolean
    popover?: boolean
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
        const hasAnswer = answers.some(({ content }) => content?.trim())
        return [{ candidate, answers, hasAnswer }]
      })
      .sort(
        (a, b) =>
          (a.candidate.number ?? Infinity) - (b.candidate.number ?? Infinity),
      )
  })
  let selection = $state<{ name: string; trigger: HTMLButtonElement }>()
  const expanded = $derived.by(() => {
    if (!popover || !selection) return
    return candidates.find(
      ({ candidate, hasAnswer }) =>
        hasAnswer && candidate.name === selection?.name,
    )
  })

  $effect(() => {
    if (!expanded) selection = undefined
  })

  async function close() {
    const trigger = selection?.trigger
    selection = undefined
    await tick()
    trigger?.focus({ preventScroll: true })
  }
</script>

<div class="candidate-group">
  <div class="candidates" class:comparison inert={Boolean(expanded)}>
    {#each candidates as { candidate, answers, hasAnswer } (candidate.name)}
      <CandidateCard
        {candidate}
        policies={answers}
        {config}
        {editable}
        {comparison}
        {banner}
        {questionLabels}
        onexpand={popover && hasAnswer
          ? (trigger) => (selection = { name: candidate.name, trigger })
          : undefined}
      />
    {/each}
  </div>

  {#if expanded}
    <div class="expanded" class:backdrop={config.backdrop}>
      <div
        class="dialog"
        role="dialog"
        tabindex="-1"
        aria-label={expanded.candidate.name}
        onkeydown={(event) => {
          if (event.key === 'Escape') void close()
        }}
        {@attach (node) => node.scrollIntoView({ block: 'nearest' })}
      >
        <CandidateCard
          candidate={expanded.candidate}
          policies={expanded.answers}
          {config}
          {questionLabels}
          banner={narrowComparison.current}
          comparison
          expanded
        />
        <button
          class="close"
          type="button"
          aria-label="收合政見全文"
          {@attach (button) => button.focus({ preventScroll: true })}
          onclick={close}><span aria-hidden="true">×</span></button
        >
      </div>
    </div>
  {/if}
</div>

<style>
  .candidate-group {
    position: relative;
    min-width: 0;
  }

  .candidate-group:has(.expanded) {
    min-height: 290px;
  }

  .candidates {
    display: grid;
    grid-template-columns: repeat(2, minmax(0, 1fr));
    gap: 40px;
    min-width: 0;
  }

  .comparison {
    padding-block: 10px 20px;
  }

  .candidates[inert] {
    visibility: hidden;
  }

  .expanded {
    --comparison-panel-background: var(--neutral-white);
    position: absolute;
    inset: 0;
    padding-block: 10px 20px;
    background: var(--comparison-panel-background);
  }

  .expanded.backdrop {
    --comparison-panel-background: var(--background);
  }

  .dialog {
    --dialog-top: calc(
      var(--site-header-offset, 0px) + var(--sticky-top-height, 0px)
    );
    position: sticky;
    inset-block-start: var(--dialog-top);
    display: grid;
    grid-template-rows: minmax(0, 1fr);
    block-size: min(100%, calc(100dvh - var(--dialog-top) - 20px));
    scroll-margin-block-start: var(--dialog-top);
  }

  .close {
    position: absolute;
    inset-block-start: 0;
    z-index: 1;
    inset-inline-end: 0;
    display: grid;
    place-items: center;
    width: 24px;
    height: 24px;
    padding: 0;
    border: 0;
    border-radius: 2px;
    background: transparent;
    color: var(--neutral-gray-800);
    font:
      24px/1 'Noto Sans TC',
      sans-serif;
    cursor: pointer;
  }

  .close:hover {
    background: var(--neutral-gray-200);
  }

  @media (width >= 768px) {
    .comparison > :global(.candidate:nth-child(even))::before {
      position: absolute;
      inset: 0 auto 0 -20px;
      border-inline-start: 1px solid var(--neutral-gray-300);
      content: '';
    }
  }

  @media (768px <= width < 1080px) {
    .close {
      background: var(--comparison-panel-background);
    }

    .comparison {
      column-gap: 20px;
    }
    .comparison > :global(.candidate:nth-child(even))::before {
      inset-inline-start: -10px;
    }
  }

  @media (width < 768px) {
    .candidates {
      grid-template-columns: minmax(0, 1fr);
      gap: 25px;
    }
  }
</style>
