<script lang="ts">
  import { mobile } from './media-query.ts'
  import type { CardExplorerConfig, Policy } from './types.ts'
  import PolicyReviews from './PolicyReviews.svelte'
  import EditableText from '@lab-reporter/ddd-shared/components/shared/EditableText.svelte'
  import TextDiff from '@lab-reporter/ddd-shared/components/shared/TextDiff.svelte'
  import { textExcerpt } from '@lab-reporter/ddd-shared/utils/text-excerpt.ts'
  const {
    policy,
    config,
    editable = false,
    compact = false,
    inlineReviews = false,
    textMode,
    questionLabel,
  }: {
    policy: Policy
    config: CardExplorerConfig
    editable?: boolean
    compact?: boolean
    inlineReviews?: boolean
    textMode: 'expandable' | 'excerpt' | 'full'
    questionLabel?: string
  } = $props()
  const reviews = $derived(
    policy.reviews.filter((review) => review.verdict?.trim()),
  )
  const full = $derived(policy.content ?? '')
  const brief = $derived(policy.brief_content ?? full)
  const hasAnswer = $derived(Boolean(full.trim()))
  const canExpand = $derived(!editable && hasAnswer && brief !== full)
  const expanded = $derived(textMode === 'full')
  const excerpt = $derived(
    canExpand && !expanded ? textExcerpt(full, brief) : undefined,
  )
  const hasInlineToggle = $derived(canExpand && textMode === 'expandable')
  let showFull = $state(false)

  $effect(() => {
    if (!hasInlineToggle) showFull = false
  })
</script>

<article class:has-heading={Boolean(policy.title)} class:compact class:expanded>
  <div class="promise" class:expandable={hasInlineToggle}>
    {#if questionLabel}
      <p class="sub-question">{questionLabel}</p>
    {/if}
    {#if policy.title || editable}<strong
        >【<EditableText
          bind:value={policy.csvRow.title}
          {editable}
          placeholder="政見標題"
        />】</strong
      >{/if}
    {#if editable}
      <EditableText
        bind:value={policy.csvRow.content}
        {editable}
        placeholder={config.labels.unanswered}
      />
    {:else if !hasAnswer}
      {config.labels.unanswered}
    {:else if expanded}
      <span class="full-text">{full.trim()}</span>
    {:else if excerpt && hasInlineToggle}
      <TextDiff
        brief={excerpt.text}
        edgeHints={excerpt}
        {full}
        {showFull}
        fontSize={policy.title && mobile.current ? 18 : 16}
      />
    {:else if excerpt}
      <div class="excerpt">
        <span class="edge-hint">{excerpt.start}</span>{excerpt.text}<span
          class="edge-hint">{excerpt.end}</span
        >
      </div>
    {:else}
      {brief}
    {/if}
    {#if hasInlineToggle}
      <button
        class="text-toggle"
        type="button"
        aria-label={showFull ? '收合政見全文' : '展開政見全文'}
        aria-expanded={showFull}
        onclick={() => (showFull = !showFull)}
      >
        <span class="toggle-icon" aria-hidden="true"></span>
      </button>
    {/if}
  </div>
  {#if policy.existingPolicy && !reviews.length}
    <span class="tag">{config.labels.existingPolicy}</span>
  {/if}
  {#if reviews.length}
    <div class="reviews">
      <PolicyReviews
        {reviews}
        {config}
        {editable}
        {compact}
        inline={inlineReviews}
        existingPolicy={policy.existingPolicy}
      />
    </div>
  {/if}
</article>

<style>
  article {
    display: flex;
    flex-direction: column;
    gap: 10px;
    min-width: 0;
    padding-bottom: 20px;
    border-bottom: 1px solid rgb(38 38 38 / 10%);
  }
  article.compact {
    padding-bottom: 0;
    border-bottom: 0;
  }
  article.expanded {
    flex-shrink: 0;
  }
  article.expanded:only-child {
    flex-grow: 1;
  }
  .compact .reviews {
    position: relative;
    z-index: 2;
  }
  .expanded .reviews:not(:has(:global(details[open]))) {
    position: sticky;
    inset-block-end: 0;
    margin-block-start: auto;
    background: var(--comparison-panel-background);
  }
  .promise {
    position: relative;
    color: var(--neutral-gray-900);
    font-size: 16px;
    font-weight: 400;
    line-height: 1.7;
    letter-spacing: 0.05em;
    overflow-wrap: anywhere;
    white-space: pre-line;
    text-align: justify;
  }
  .promise.expandable {
    padding-inline-end: 30px;
  }
  .sub-question {
    margin: 0;
    color: var(--neutral-gray-700);
    font-family: 'Noto Sans TC', sans-serif;
    font-size: 12px;
    font-weight: 500;
    letter-spacing: 0.05em;
  }
  .expanded .promise {
    padding-inline-end: 28px;
  }
  .full-text,
  .excerpt {
    white-space: pre-wrap;
  }
  .edge-hint {
    color: var(--neutral-gray-500, #9c9c9c);
  }
  .text-toggle {
    position: absolute;
    inset: 0;
    display: flex;
    align-items: flex-start;
    justify-content: flex-end;
    padding: 0;
    border: 0;
    border-radius: 2px;
    background: transparent;
    color: inherit;
    cursor: pointer;
  }
  .toggle-icon {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: 1px;
    width: 20px;
    height: 24px;
    border-radius: 2px;
  }
  .text-toggle[aria-expanded='true'] .toggle-icon {
    flex-direction: column-reverse;
  }
  .toggle-icon::before,
  .toggle-icon::after {
    content: '';
    width: 5px;
    height: 5px;
    border: solid currentColor;
    border-width: 0 1.5px 1.5px 0;
  }
  .toggle-icon::before {
    transform: rotate(-135deg);
  }
  .toggle-icon::after {
    transform: rotate(45deg);
  }
  .text-toggle:hover .toggle-icon {
    background: var(--neutral-gray-200);
  }
  .text-toggle:focus-visible {
    outline: 2px solid var(--brand-heavy);
    outline-offset: 2px;
  }
  strong {
    font-weight: 500;
  }
  .tag {
    display: inline-flex;
    align-items: center;
    align-self: start;
    padding: 2px 6px;
    border-radius: 2px;
    background: var(--neutral-gray-200);
    font-size: 12px;
    line-height: 1.7;
    letter-spacing: 0.05em;
  }
  @media (width < 768px) {
    article.has-heading .promise {
      font-size: 18px;
    }
  }
</style>
