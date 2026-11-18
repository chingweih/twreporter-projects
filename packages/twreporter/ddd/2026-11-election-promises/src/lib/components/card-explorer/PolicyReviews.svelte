<script lang="ts">
  import type { CardExplorerConfig, Review } from './types.ts'
  import EditableText from '@lab-reporter/ddd-shared/components/shared/EditableText.svelte'
  import ReviewQuote from './ReviewQuote.svelte'

  const {
    reviews,
    config,
    editable = false,
    initiallyOpen = false,
    existingPolicy = false,
  }: {
    reviews: Review[]
    config: CardExplorerConfig
    editable?: boolean
    initiallyOpen?: boolean
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

<details open={initiallyOpen}>
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
            <div class="attribution">
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
      >{config.labels.reviewDetails}<span class="arrow" aria-hidden="true"
      ></span></span
    >
  </summary>
  {#if detailedReviews.length}<div class="reviews">
      {#each detailedReviews as review}
        <ReviewQuote
          {review}
          verdict={config.verdicts.find(
            (item) => item.label === review.verdict,
          )}
          {editable}
        />
      {/each}
    </div>{/if}
</details>

<style>
  summary {
    display: flex;
    align-items: flex-end;
    justify-content: space-between;
    list-style: none;
    cursor: pointer;
  }
  summary::-webkit-details-marker {
    display: none;
  }
  summary:focus-visible {
    outline: 2px solid var(--brand-heavy);
    outline-offset: 3px;
  }
  .verdicts {
    display: flex;
    flex: 1;
    gap: 45px;
    min-width: 0;
  }
  .verdict {
    display: flex;
    flex-shrink: 1;
    align-items: stretch;
    gap: 10px;
    min-width: 0;
  }
  .swatch {
    flex-shrink: 0;
    width: 3px;
    border-radius: 1px;
  }
  .attribution {
    display: flex;
    flex-direction: column;
    align-items: flex-start;
    min-width: 0;
    font-size: 18px;
    line-height: 1.5;
    letter-spacing: 0.05em;
    overflow-wrap: anywhere;
  }
  .label,
  select {
    color: var(--neutral-gray-800);
    font-size: 18px;
    font-weight: 500;
  }
  select {
    min-width: 0;
    max-width: 100%;
    background: transparent;
    font-family: inherit;
  }
  .source {
    color: var(--neutral-gray-500);
    font-size: 12px;
    font-weight: 400;
    letter-spacing: 0.05em;
  }
  .label-row {
    display: flex;
    align-items: center;
    gap: 5px;
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
    color: var(--neutral-gray-500);
    font-size: 12px;
    line-height: 1.5;
    letter-spacing: 0.05em;
    white-space: nowrap;
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
  .reviews {
    display: flex;
    flex-direction: column;
    gap: 5px;
    padding-top: 10px;
  }
</style>
