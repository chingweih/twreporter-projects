<script lang="ts">
  import { getContext } from 'svelte'
  import { innerHeight } from 'svelte/reactivity/window'
  import { citySelection } from '../../city-selection.svelte.ts'
  import Shell from '@lab-reporter/ddd-shared/components/shared/Shell.svelte'
  import { createGraphic } from '@lab-reporter/ddd-shared/utils/graphic-data.svelte.ts'
  import { followTwreporterHeader } from '@lab-reporter/ddd-shared/utils/site-header.ts'
  import { mobile } from './media-query.ts'
  import type { ExplorerProps } from './types.ts'
  import { readPolicies } from './data.ts'
  import FilterTabs from '@lab-reporter/ddd-shared/components/shared/FilterTabs.svelte'
  import CandidateCards from './CandidateCards.svelte'
  import CityComparison from './CityComparison.svelte'
  import StickySummary from './StickySummary.svelte'
  import EditableText from '@lab-reporter/ddd-shared/components/shared/EditableText.svelte'
  import {
    cardExplorerGraphic,
    type CardExplorerGraphic,
  } from './graphic-context.ts'

  let {
    sources,
    config: configUrl = '',
    categoryId = $bindable(),
    topicId = $bindable(''),
    city = $bindable(''),
    comparison = false,
    full = false,
  }: Partial<ExplorerProps> & {
    comparison?: boolean
    full?: boolean
  } = $props()
  const graphic =
    getContext<CardExplorerGraphic | undefined>(cardExplorerGraphic.context) ??
    createGraphic(
      cardExplorerGraphic.name,
      cardExplorerGraphic.schema,
      () => ({ sources, config: configUrl }),
      cardExplorerGraphic.queryOptions,
    )
  const config = $derived(graphic.config)
  const data = $derived.by(() => {
    if (!config) return { policies: [], error: undefined }
    try {
      const answers = graphic.sources?.find((source) => source.id === 'answers')
      const reviews = graphic.sources?.find((source) => source.id === 'reviews')
      if (graphic.sources && (!answers || !reviews))
        throw new Error('請提供 answers 與 reviews 兩個資料來源。')
      return {
        policies:
          answers && reviews ? readPolicies({ answers, reviews, config }) : [],
        error: undefined,
      }
    } catch (error) {
      return {
        policies: [],
        error: error instanceof Error ? error.message : '無法讀取政見資料。',
      }
    }
  })
  const category = $derived(
    categoryId === undefined
      ? config?.categories[0]
      : config?.categories.find((item) => item.id === categoryId),
  )
  const topic = $derived(
    topicId
      ? category?.topics.find((item) => item.id === topicId)
      : category?.topics[0],
  )
  const questionLabels = $derived(
    new Map(topic?.questions?.map(({ id, label }) => [id, label])),
  )
  const categoryPolicies = $derived(
    data.policies.filter((policy) =>
      category?.topics.some((item) => policy.questionId.startsWith(item.id)),
    ),
  )
  const cities = $derived(
    [...new Set(categoryPolicies.map((policy) => policy.city))].map(
      (value) => ({ value, label: value }),
    ),
  )
  // A tab click overrides the page's city in this explorer until the selection inputs change.
  let selectedCity = $derived(citySelection.current || city)
  const activeCity = $derived(
    cities.find(({ value }) => value === selectedCity)?.value ??
      cities.find(({ value }) => value === city)?.value ??
      cities[0]?.value ??
      '',
  )
  const visiblePolicies = $derived(
    categoryPolicies.filter(
      (policy) =>
        topic &&
        policy.questionId.startsWith(topic.id) &&
        (comparison || policy.city === activeCity),
    ),
  )
  const selectionError = $derived(
    !config
      ? undefined
      : !category
        ? '找不到指定領域。'
        : !topic
          ? '找不到指定主題。'
          : undefined,
  )
  const error = $derived(graphic.error ?? data.error ?? selectionError)
  let showStickyTop = $state(false)

  function observeStickyRange(node: HTMLElement) {
    // Observe the viewport's top edge. The attachment reruns when its height changes.
    const height = innerHeight.current
    if (height === undefined) return
    const observer = new IntersectionObserver(
      (entries) => (showStickyTop = entries.at(-1)?.isIntersecting ?? false),
      { root: document, rootMargin: `0px 0px -${height}px 0px` },
    )
    observer.observe(node)
    return () => observer.disconnect()
  }
</script>

<div class="explorer" {@attach followTwreporterHeader}>
  {#if category && config}
    {#snippet categorySelector()}
      <FilterTabs
        class="category"
        options={config.categories.map(({ id, label }) => ({
          value: String(id),
          label,
        }))}
        value={String(category.id)}
        label="政見領域"
        onchange={(value) => {
          const nextCategoryId = Number(value)
          if (nextCategoryId === category?.id) return
          categoryId = nextCategoryId
          topicId = ''
        }}
      >
        {#snippet optionLabel(option)}
          {@const item = config.categories.find(
            ({ id }) => String(id) === option.value,
          )}
          {#if item}
            <EditableText bind:value={item.label} editable={graphic.editable} />
          {/if}
        {/snippet}
      </FilterTabs>
    {/snippet}
    <Shell
      bind:title={category.label}
      bind:subtitle={config.subtitle}
      wide={config.wide}
      backdrop={config.backdrop}
      editable={graphic.editable}
      {error}
      loading={graphic.loading}
      heading={full ? categorySelector : undefined}
    >
      {#snippet beforeHeader()}
        {#if config.footnotes.length}
          <div class="footnotes">
            {#each config.footnotes as _, index}
              <p>
                <EditableText
                  bind:value={config.footnotes[index]}
                  editable={graphic.editable}
                />
              </p>
            {/each}
          </div>
        {/if}
      {/snippet}
      {#snippet topRight()}
        <FilterTabs
          class="topic"
          options={category.topics.map((item) => ({
            value: item.id,
            label: item.label,
          }))}
          value={topic?.id}
          label="政見主題"
          onchange={(value) => (topicId = value)}
        >
          {#snippet optionLabel(option)}
            {@const item = category.topics.find(
              (item) => item.id === option.value,
            )}
            {#if item}<EditableText
                bind:value={item.label}
                editable={graphic.editable}
              />{/if}
          {/snippet}
        </FilterTabs>
      {/snippet}
      <div class="intro">
        {#if topic && (topic.question || graphic.editable)}
          <p class="question">
            <EditableText
              bind:value={topic.question}
              editable={graphic.editable}
              placeholder="題目文字"
            />
          </p>
        {/if}
      </div>
      <div
        class="results"
        class:comparison
        style:--sticky-top-height={showStickyTop
          ? 'var(--sticky-summary-height)'
          : '0px'}
      >
        <span
          class="sticky-range"
          aria-hidden="true"
          {@attach observeStickyRange}
        ></span>
        <div class="sticky-anchor">
          {#if showStickyTop}
            <StickySummary
              {comparison}
              city={comparison ? undefined : activeCity}
              categoryLabel={category.label}
              {topic}
              backdrop={config.backdrop}
              scrollLabels={mobile.current}
            />
          {/if}
        </div>
        {#if comparison}
          {#key topic?.id}
            <CityComparison
              policies={visiblePolicies}
              {config}
              editable={graphic.editable}
              {questionLabels}
            />
          {/key}
        {:else}
          <FilterTabs
            class="city"
            options={cities}
            value={activeCity}
            label="縣市"
            onchange={(value) => {
              city = value
              selectedCity = value
            }}
          />
          <CandidateCards
            policies={visiblePolicies}
            {config}
            editable={graphic.editable}
            banner={mobile.current}
            {questionLabels}
          />
        {/if}
      </div>
    </Shell>
  {:else}
    <Shell {error} loading={graphic.loading} />
  {/if}
</div>

<style>
  .explorer {
    -webkit-font-smoothing: antialiased;
    -moz-osx-font-smoothing: grayscale;
    font-synthesis: none;
  }

  .explorer :global(.outer),
  .explorer :global(.outer.wide) {
    margin: 0 auto;
    width: 100%;
    max-width: 1920px;
    font-weight: 400;
    line-height: 1.7;
  }

  .explorer :global(.subtitle),
  .explorer :global(.status) {
    line-height: 1.7;
  }

  .explorer :global(.container) {
    border: 0;
  }

  .explorer :global(.outer > .container) {
    border-block: 2px solid var(--neutral-gray-200);
  }

  .explorer :global(.frame) {
    padding: 18px 48px 42px 56px;
    gap: 10px;
    color: var(--neutral-gray-800);
  }

  .explorer :global(.top) {
    align-items: center;
    flex-wrap: wrap;
    gap: 10px;
  }

  .explorer :global(.top .corner.right) {
    width: auto;
    max-width: 80vw;
  }

  .explorer :global(.header h1) {
    font-size: 24px;
    line-height: 1.7;
    letter-spacing: 0.01em;
  }

  .explorer :global(.bottom) {
    display: none;
  }

  .intro {
    position: relative;
    display: flex;
    flex-direction: column;
    gap: 10px;
    min-width: 0;
  }

  .question {
    margin: 0;
    font-size: 18px;
    line-height: 1.7;
    letter-spacing: 0.01em;
  }

  .results {
    --sticky-summary-height: 55px;
    position: relative;
    display: flex;
    flex-direction: column;
    min-width: 0;
    gap: 15px;
  }

  .sticky-range {
    position: absolute;
    inset: calc(0px - var(--site-header-offset, 0px)) 0
      var(--site-header-offset, 0px);
    pointer-events: none;
    transition:
      top var(--site-header-transition, 0s),
      bottom var(--site-header-transition, 0s);
  }

  .sticky-anchor {
    position: sticky;
    top: var(--site-header-offset, 0px);
    z-index: 2;
    height: 0;
    margin-bottom: -15px;
    transition: top var(--site-header-transition, 0s);
  }

  .footnotes {
    display: flex;
    flex-direction: column;
    gap: 7px;
    min-height: 26px;
    text-align: center;
    color: var(--neutral-gray-500);
    font-family: 'Noto Sans TC', sans-serif;
    font-size: 14px;
    line-height: 1.5;
    letter-spacing: 0.01em;
  }

  .footnotes p {
    margin: 0;
    text-wrap: balance;
  }

  @media (width >= 768px) {
    .footnotes {
      padding-inline: 5px;
    }
  }

  .explorer :global(.filter-tabs) {
    --brand-main: var(--brand-heavy);
    --neutral-gray-50: var(--neutral-white);
  }

  .explorer :global(.backdrop .filter-tabs) {
    --neutral-gray-50: var(--neutral-gray-100);
  }

  .explorer :global(.filter-tabs button) {
    justify-content: flex-start;
    border-color: var(--neutral-gray-300);
    color: var(--neutral-gray-300);
    background: transparent;
    line-height: 1.7;
    letter-spacing: 0.05em;
  }

  .explorer :global(.filter-tabs button:hover:not(.active)) {
    color: var(--neutral-gray-700);
    border-color: var(--neutral-gray-700);
  }

  .explorer :global(.filter-tabs button:focus-visible) {
    outline-offset: -4px;
  }

  .explorer :global(.filter-tabs button.active) {
    border-color: var(--brand-main);
    background: var(--brand-main);
    color: var(--neutral-white);
    font-weight: 600;
  }

  .explorer :global(.category) {
    --brand-main: var(--neutral-gray-800);
  }

  .explorer :global(.category button) {
    padding: 3px 17px;
    border-color: var(--neutral-gray-800);
    border-radius: 22px;
    color: var(--neutral-gray-800);
    font-family: 'Noto Sans TC', sans-serif;
    font-size: 24px;
    font-weight: 700;
    line-height: 1.5;
    letter-spacing: 0.01em;
    white-space: nowrap;
  }

  .explorer :global(.category button.active) {
    color: var(--neutral-gray-100);
    font-weight: 600;
  }

  .explorer :global(.topic .chips) {
    gap: 5px;
    min-height: 32px;
  }

  .explorer :global(.topic .fade) {
    right: 0;
    width: 30.2885%;
  }

  .explorer :global(.topic button) {
    border-width: 1.5px;
    padding: 2px 12px;
    border-radius: 40px;
    font-size: 14px;
    font-weight: 200;
    transition: all 0.1s ease-in-out;
  }

  .explorer :global(.city) {
    --brand-main: var(--neutral-gray-800);
  }

  .explorer :global(.city .chips) {
    gap: 0;
  }

  .explorer :global(.city button) {
    flex: 1;
    padding: 4px 12px;
    border-width: 1px;
    border-radius: 0;
    font-size: 16px;
    font-weight: 400;
    transition: all 0.1s ease-in-out;
  }
  @media (width < 768px) {
    .explorer :global(.frame) {
      padding: 34px;
      gap: 5px;
    }
    .explorer :global(.top) {
      flex-direction: column;
      flex-wrap: nowrap;
      align-items: stretch;
      gap: 5px;
    }
    .explorer :global(.top .corner.right) {
      width: 100%;
      max-width: 100%;
      margin-left: 0;
    }
    .explorer :global(.topic button) {
      padding: 2px 12px;
      border-width: 1px;
      font-size: 16px;
    }
    .explorer :global(.city button) {
      flex: none;
      padding: 6px 10px;
      font-size: 14px;
    }
    .results:not(.comparison) {
      margin-top: 5px;
    }
  }
</style>
