<script lang="ts">
  import type { CardExplorerConfig, Review } from './types.ts'
  import EditableText from '@lab-reporter/ddd-shared/components/shared/EditableText.svelte'
  import ReviewQuote from './ReviewQuote.svelte'

  const {
    reviews,
    config,
    editable = false,
    existingPolicy = false,
  }: {
    reviews: Review[]
    config: CardExplorerConfig
    editable?: boolean
    existingPolicy?: boolean
  } = $props()
  const detailedReviews = $derived(
    reviews.filter((review) => review.analysis.trim()),
  )
  const groups = $derived.by(() => {
    const result: { label: Review['verdict']; reviews: Review[] }[] = []
    for (const review of reviews) {
      const group = editable
        ? undefined
        : result.find((group) => group.label === review.verdict)
      if (group) group.reviews.push(review)
      else result.push({ label: review.verdict, reviews: [review] })
    }
    return result
  })
</script>

<details>
  <summary
    onclick={(event) => {
      if (
        editable &&
        event.target instanceof HTMLElement &&
        event.target.closest('[contenteditable], select')
      )
        event.preventDefault()
    }}
  >
    <div class="verdicts">
      {#each groups as group, index}
        {@const verdict = config.verdicts.find(
          (item) => item.label === group.label,
        )}
        {#if verdict}
          <div class="verdict">
            <span
              class="swatch"
              style:background={verdict.color}
              aria-hidden="true"
            ></span>
            <div
              class="attribution"
              class:existing-policy={existingPolicy && index === 0}
            >
              <div class="label-row">
                {#if editable}
                  {@const review = group.reviews[0]}
                  {#if review}
                    <select
                      aria-label="評比"
                      bind:value={review.csvRow.verdict}
                    >
                      {#each config.verdicts as option}<option
                          value={option.label}>{option.label}</option
                        >{/each}
                    </select>
                  {/if}
                {:else}
                  <span class="label">{verdict.label}</span>
                {/if}
                {#if existingPolicy && index === 0}<span class="tag"
                    >{config.labels.existingPolicy}</span
                  >{/if}
              </div>
              <span class="source"
                >{#each group.reviews as review, sourceIndex}{#if sourceIndex > 0}、{/if}<EditableText
                    bind:value={review.csvRow.source}
                    {editable}
                  />{/each}</span
              >
            </div>
          </div>
        {/if}
      {/each}
    </div>
    <span class="toggle"
      ><span class="toggle-label">{config.labels.reviewDetails}</span><span
        class="arrow"
        aria-hidden="true"
      ></span></span
    >
  </summary>
  {#if detailedReviews.length}
    <div class="review-content">
      <div class="reviews">
        {#each detailedReviews as review}
          <ReviewQuote
            {review}
            verdict={config.verdicts.find(
              (item) => item.label === review.verdict,
            )}
            {editable}
          />
        {/each}
      </div>
      <button
        class="collapse"
        onclick={(event) => {
          const summary = event.currentTarget
            .closest('details')
            ?.querySelector('summary')
          summary?.click()
          summary?.focus()
        }}
        >隱藏{config.labels.reviewDetails}<span class="arrow" aria-hidden="true"
        ></span></button
      >
    </div>
  {/if}
</details>

<style>
  summary {
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    gap: 5px 10px;
    list-style: none;
    cursor: pointer;
    transition: all 0.1s ease-in-out;
    border-radius: 2px;
  }
  summary::-webkit-details-marker {
    display: none;
  }
  summary:focus-visible {
    outline: 2px solid var(--brand-heavy);
    outline-offset: 3px;
  }
  summary:hover {
    background-color: var(--neutral-gray-50);
  }
  .verdicts {
    display: flex;
    flex: 1 1 min-content;
    flex-wrap: wrap;
    gap: 6px 24px;
    min-width: 0;
  }
  .verdict {
    display: flex;
    align-items: stretch;
    gap: 10px;
    min-width: 0;
    max-width: 100%;
  }
  .swatch {
    flex-shrink: 0;
    width: 3px;
    border-radius: 1px;
  }
  .attribution {
    display: flex;
    flex-wrap: wrap;
    align-items: flex-end;
    gap: 0 5px;
    min-width: 0;
    font-size: 16px;
    line-height: 1.7;
    letter-spacing: 0.05em;
    overflow-wrap: anywhere;
  }
  .attribution.existing-policy {
    flex-direction: column;
    align-items: flex-start;
    gap: 0;
  }
  .label,
  select {
    color: var(--neutral-gray-800);
    font-size: 16px;
    font-weight: 600;
  }
  .label {
    overflow-wrap: break-word;
    word-break: keep-all;
  }
  select {
    min-width: 0;
    max-width: 100%;
    background: transparent;
    font-family: inherit;
    line-height: 1.7;
  }
  .source {
    color: var(--neutral-gray-500);
    font-size: 12px;
    font-weight: 400;
    letter-spacing: 0.05em;
  }
  .label-row {
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    gap: 5px;
    min-width: 0;
  }
  .tag {
    flex-shrink: 0;
    border-radius: 2px;
    padding: 2px 6px;
    background: var(--neutral-gray-200);
    color: var(--neutral-gray-800);
    font-size: 12px;
    font-weight: 400;
    letter-spacing: 0.05em;
  }
  .toggle {
    display: flex;
    align-items: center;
    flex-shrink: 0;
    justify-content: center;
    margin-inline-start: auto;
    color: var(--neutral-gray-500);
    font-size: 12px;
    line-height: 1.7;
    letter-spacing: 0.05em;
    white-space: nowrap;
  }
  summary:focus-visible .toggle {
    background-color: var(--neutral-gray-200);
  }
  @media (prefers-reduced-motion: reduce) {
    .toggle {
      transition: none;
    }
  }
  .arrow {
    display: grid;
    place-items: center;
    width: 16px;
    height: 16px;
  }
  .arrow::before {
    width: 5px;
    height: 5px;
    border-right: 1px solid currentColor;
    border-bottom: 1px solid currentColor;
    transform: translateY(-1px) rotate(45deg);
    content: '';
  }
  details[open] .toggle {
    color: var(--neutral-gray-300);
  }
  details[open] .arrow {
    transform: rotate(180deg);
  }
  .review-content {
    min-block-size: 0;
  }
  @media (prefers-reduced-motion: no-preference) {
    details::details-content {
      display: grid;
      grid-template-rows: 0fr;
      overflow: clip;
      transition:
        grid-template-rows 240ms ease,
        content-visibility 240ms allow-discrete;
    }
    details[open]::details-content {
      grid-template-rows: 1fr;
    }
    summary .arrow {
      transition: transform 240ms ease;
    }
  }
  .reviews {
    display: flex;
    flex-direction: column;
    gap: 5px;
    padding-top: 10px;
  }
  .collapse {
    display: none;
  }

  @media (width < 768px) {
    summary {
      gap: 5px;
    }
    summary:hover {
      background-color: transparent;
    }
    .verdicts {
      column-gap: 15px;
    }
    .verdict {
      gap: 5px;
    }
    .attribution {
      flex-direction: column;
      align-items: flex-start;
      gap: 0;
    }
    .toggle-label {
      position: absolute;
      width: 1px;
      height: 1px;
      overflow: hidden;
      clip-path: inset(50%);
    }
    .collapse {
      display: flex;
      align-items: center;
      justify-content: center;
      width: 100%;
      margin-top: 10px;
      padding: 3px 6px 3px 12px;
      border: 0;
      border-radius: 33px;
      background: var(--neutral-gray-200);
      color: var(--neutral-gray-600);
      font: inherit;
      font-size: 12px;
      cursor: pointer;
    }
  }
</style>
