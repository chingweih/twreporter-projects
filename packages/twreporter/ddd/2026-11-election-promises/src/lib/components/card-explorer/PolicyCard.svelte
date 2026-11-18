<script lang="ts">
  import type { CardExplorerConfig, Policy } from './types.ts'
  import PolicyReviews from './PolicyReviews.svelte'
  import EditableText from '@lab-reporter/ddd-shared/components/shared/EditableText.svelte'
  const {
    policy,
    config,
    editable = false,
    initiallyOpen = false,
  }: {
    policy: Policy
    config: CardExplorerConfig
    editable?: boolean
    initiallyOpen?: boolean
  } = $props()
  const reviews = $derived(
    policy.reviews.filter((review) => review.verdict?.trim()),
  )
</script>

<article class:has-heading={Boolean(policy.title)}>
  <p class="promise">
    {#if policy.title || editable}<strong
        >【<EditableText
          bind:value={policy.csvRow.title}
          {editable}
          placeholder="政見標題"
        />】</strong
      >{/if}<EditableText
      bind:value={policy.csvRow.content}
      {editable}
      placeholder={config.labels.unanswered}
    />
  </p>
  {#if policy.existingPolicy && !reviews.length}
    <span class="tag">{config.labels.existingPolicy}</span>
  {/if}
  {#if reviews.length}<PolicyReviews
      {reviews}
      {config}
      {editable}
      {initiallyOpen}
      existingPolicy={policy.existingPolicy}
    />{/if}
</article>

<style>
  article {
    display: flex;
    flex-direction: column;
    gap: 2.5px;
    min-width: 0;
    padding-bottom: 7px;
    border-bottom: 0.5px solid var(--neutral-black);
  }
  article:last-child {
    border-bottom: 0;
  }
  article.has-heading {
    gap: 5px;
  }
  .promise {
    margin: 0;
    color: var(--neutral-black);
    font-size: 12px;
    font-weight: 400;
    line-height: 1.5;
    letter-spacing: 0.05em;
    overflow-wrap: anywhere;
    white-space: pre-line;
  }
  strong {
    font-weight: 500;
  }
  .tag {
    display: inline-flex;
    align-items: center;
    gap: 2.5px;
    align-self: start;
    padding: 1.5px 4px;
    border-radius: 1px;
    background: var(--neutral-gray-200);
    font-size: 8px;
    line-height: 1.5;
    letter-spacing: 0.05em;
  }
</style>
