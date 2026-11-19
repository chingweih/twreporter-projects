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
    gap: 10px;
    min-width: 0;
    padding-bottom: 20px;
    border-bottom: 1px solid rgb(38 38 38 / 10%);
  }
  article.has-heading {
    gap: 10px;
  }
  .promise {
    margin: 0;
    color: var(--neutral-gray-900);
    font-size: 16px;
    font-weight: 400;
    line-height: 1.7;
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
