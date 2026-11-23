<script lang="ts">
  import { Marquee } from '@selemondev/svelte-marquee'
  import type { Topic } from './types.ts'

  const minimumMarqueeWidth = 128
  const {
    city,
    comparison,
    categoryLabel,
    topic,
    backdrop,
    scrollLabels,
  }: {
    city?: string
    comparison: boolean
    categoryLabel: string
    topic?: Topic
    backdrop: boolean
    scrollLabels: boolean
  } = $props()

  let headerWidth = $state(0)
  let labelsWidth = $state(0)
  let textWidth = $state(0)
  const hasFixedLabels = $derived(Boolean(city) || !scrollLabels)
  const availableWidth = $derived(
    headerWidth - (hasFixedLabels ? labelsWidth : 0),
  )
  const animate = $derived(
    availableWidth >= minimumMarqueeWidth && textWidth > availableWidth,
  )
</script>

{#snippet stickySummaryLabels()}
  <strong>{categoryLabel}</strong>｜<strong>{topic?.label}</strong
  >{#if topic?.question}｜{/if}
{/snippet}
{#snippet stickyScrollingText()}
  {#if scrollLabels}{@render stickySummaryLabels()}{/if}{topic?.question ?? ''}
{/snippet}
<!-- svelte-ignore a11y_no_noninteractive_tabindex (Keyboard users need focus to scroll this region.) -->
<div
  class="sticky-top"
  class:backdrop
  class:scroll-labels={scrollLabels}
  class:comparison
  role="region"
  aria-label="目前政見摘要"
  tabindex="0"
  bind:clientWidth={headerWidth}
>
  {#if hasFixedLabels}
    <div class="sticky-labels" bind:offsetWidth={labelsWidth}>
      {#if city}
        <span class="sticky-city">{city}</span>
      {/if}
      {#if !scrollLabels}
        <span class="sticky-summary">{@render stickySummaryLabels()}</span>
      {/if}
    </div>
  {/if}
  {#if scrollLabels || topic?.question}
    <div class="sticky-question" class:animated={animate}>
      <span class="sticky-question-text" bind:offsetWidth={textWidth}
        >{@render stickyScrollingText()}</span
      >
      {#if animate}
        <div class="sticky-question-marquee" aria-hidden="true">
          {#key `${scrollLabels}:${categoryLabel}:${topic?.id}:${topic?.question ?? ''}`}
            <Marquee
              fade
              class="sticky-marquee-track"
              innerClassName="sticky-marquee-copy"
              ><span>{@render stickyScrollingText()}</span></Marquee
            >
          {/key}
        </div>
      {/if}
    </div>
  {/if}
</div>

<style>
  .sticky-top {
    display: flex;
    align-items: center;
    height: var(--sticky-summary-height);
    padding-block: 15px;
    border-bottom: 1px solid var(--neutral-gray-300);
    background: var(--neutral-white);
    color: var(--neutral-gray-800);
    overflow-x: auto;
    overflow-y: hidden;
    scrollbar-width: none;
    white-space: nowrap;
    animation: sticky-top-enter 180ms ease-out;
  }

  .sticky-top::-webkit-scrollbar {
    display: none;
  }

  .sticky-top:focus-visible {
    outline-offset: -2px;
  }

  @keyframes sticky-top-enter {
    from {
      opacity: 0;
      transform: translateY(-6px);
    }
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }

  @media (prefers-reduced-motion: reduce) {
    .sticky-top {
      animation: none;
    }
  }

  .sticky-top.backdrop {
    background: var(--background);
  }

  .sticky-city {
    flex-shrink: 0;
    border-radius: 2px;
    padding: 5px;
    background: var(--neutral-gray-800);
    color: var(--neutral-gray-100);
    font-size: 13px;
    font-weight: 700;
    line-height: 1;
    letter-spacing: 0.13px;
  }

  .sticky-labels {
    display: flex;
    align-items: center;
    gap: 6px;
    flex-shrink: 0;
    padding-inline-end: 6px;
  }

  .scroll-labels .sticky-labels {
    position: sticky;
    inset-inline-start: 0;
    z-index: 1;
    background: inherit;
  }

  .sticky-summary,
  .sticky-question {
    flex-shrink: 0;
    font-size: 16px;
    line-height: 1.5;
    letter-spacing: 0.16px;
  }

  .sticky-top.comparison {
    font-family: 'Noto Sans TC', sans-serif;
  }

  .sticky-question-text {
    display: inline-block;
  }

  .sticky-question-marquee {
    display: none;
  }

  /* Style the library's tracks here so its utility CSS stays out of the host page. */
  .sticky-question-marquee :global(.sticky-marquee-track) {
    --marquee-gap: 1rem;
    display: flex;
    gap: var(--marquee-gap);
    overflow: hidden;
  }

  .sticky-question-marquee :global(.sticky-marquee-copy) {
    flex: none;
    animation: scroll-question 40s linear infinite;
  }

  @keyframes scroll-question {
    to {
      transform: translateX(calc(-100% - var(--marquee-gap)));
    }
  }

  @media (hover: hover) {
    .sticky-question-marquee:hover :global(.sticky-marquee-copy) {
      animation-play-state: paused;
    }
  }

  /* Keep static text readable on focus or reduced motion. During playback it remains available to screen readers. */
  @media (prefers-reduced-motion: no-preference) {
    .sticky-top:not(:focus-within) .sticky-question.animated {
      position: relative;
      flex: 1;
      min-width: 0;
      overflow: clip;
    }

    .sticky-top:not(:focus-within) .animated .sticky-question-text {
      position: absolute;
      clip-path: inset(50%);
    }

    .sticky-top:not(:focus-within) .animated .sticky-question-marquee {
      display: block;
    }
  }
</style>
