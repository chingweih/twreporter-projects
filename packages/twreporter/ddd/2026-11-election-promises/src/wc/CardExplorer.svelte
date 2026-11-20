<script lang="ts">
  import { getContext } from 'svelte'
  import { citySelection } from '../lib/city-selection.svelte.ts'
  import Shell from '@lab-reporter/ddd-shared/components/shared/Shell.svelte'
  import { createGraphic } from '@lab-reporter/ddd-shared/utils/graphic-data.svelte.ts'
  import {
    cardExplorerConfigSchema,
    type ExplorerProps,
  } from '../lib/components/card-explorer/types.ts'
  import { readPolicies } from '../lib/components/card-explorer/data.ts'
  import FilterTabs from '@lab-reporter/ddd-shared/components/shared/FilterTabs.svelte'
  import ChipSelector from '@lab-reporter/ddd-shared/components/shared/ChipSelector.svelte'
  import CandidateCard from '../lib/components/card-explorer/CandidateCard.svelte'
  import EditableText from '@lab-reporter/ddd-shared/components/shared/EditableText.svelte'
  import {
    cardExplorerGraphicContext,
    type CardExplorerGraphic,
  } from '../lib/components/card-explorer/graphic-context.ts'

  let {
    sources,
    config: configUrl = '',
    categoryId,
    topicId = $bindable(''),
    city = $bindable(''),
  }: Partial<ExplorerProps> = $props()
  const graphic =
    getContext<CardExplorerGraphic | undefined>(cardExplorerGraphicContext) ??
    createGraphic('twreporter-card-explorer', cardExplorerConfigSchema, () => ({
      sources,
      config: configUrl,
    }))
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
  const defaultCity = $derived(citySelection.current)
  let activeCity = $derived(
    cities.find((option) => option.value === defaultCity)?.value ||
      city ||
      cities[0]?.value ||
      '',
  )
  let selectedVerdict = $state<string | undefined>()
  const visiblePolicies = $derived(
    categoryPolicies.filter(
      (policy) =>
        topic &&
        policy.questionId.startsWith(topic.id) &&
        policy.city === activeCity &&
        (selectedVerdict === undefined ||
          policy.reviews.some((review) => review.verdict === selectedVerdict)),
    ),
  )
  const candidateNames = $derived([
    ...new Set(visiblePolicies.map((policy) => policy.candidate)),
  ])
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

  function observeIntro(node: HTMLDivElement) {
    const observer = new IntersectionObserver(([entry]) => {
      showStickyTop = entry.boundingClientRect.bottom <= 0
    })
    observer.observe(node)
    return { destroy: () => observer.disconnect() }
  }
</script>

<div class="explorer" class:no-footnotes={!config?.footnotes.length}>
  {#if category && config}
    <Shell
      bind:title={category.label}
      bind:subtitle={config.subtitle}
      bind:footnotes={config.footnotes}
      wide={config.wide}
      backdrop={config.backdrop}
      editable={graphic.editable}
      {error}
      loading={graphic.loading}
    >
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
      <div class="intro" use:observeIntro>
        {#if topic && (topic.question || graphic.editable)}<p class="question">
            <EditableText
              bind:value={topic.question}
              editable={graphic.editable}
              placeholder="題目文字"
            />
          </p>{/if}
      </div>
      <div
        class="results"
        style:--sticky-top-height={showStickyTop ? '55px' : '0px'}
      >
        <div class="sticky-anchor">
          {#if showStickyTop}
            <!-- svelte-ignore a11y_no_noninteractive_tabindex (Keyboard users need focus to scroll this region.) -->
            <div
              class="sticky-top"
              class:backdrop={config.backdrop}
              role="region"
              aria-label="目前政見摘要"
              tabindex="0"
            >
              <span class="sticky-city">{activeCity}</span>
              <span class="sticky-summary"
                ><strong>{category.label}</strong>｜<strong
                  >{topic?.label}</strong
                >｜{topic?.question ?? ''}</span
              >
            </div>
          {/if}
        </div>
        <FilterTabs
          class="city"
          options={cities}
          value={activeCity}
          label="縣市"
          onchange={(value) => {
            city = value
            activeCity = value
          }}
        />
        <div class="verdict-filter">
          <ChipSelector
            options={config.verdicts.map((verdict) => ({
              value: verdict.label,
              label: verdict.label,
              color: verdict.color,
            }))}
            value={selectedVerdict}
            label="依評比篩選政見"
            onchange={(value) =>
              (selectedVerdict = selectedVerdict === value ? undefined : value)}
          />
        </div>
        <div class="candidates">
          {#each candidateNames as name, index (name)}
            {@const candidate = config.candidates.find(
              (item) => item.name === name,
            )}
            {#if candidate}
              <CandidateCard
                {candidate}
                policies={visiblePolicies.filter(
                  (policy) => policy.candidate === name,
                )}
                {config}
                editable={graphic.editable}
                initiallyOpen={index === 0}
              />
            {/if}
          {/each}
        </div>
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
  .explorer :global(.footnotes p),
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
    padding: 38px 48px 42px 56px;
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

  .explorer :global(.bottom .right),
  .no-footnotes :global(.bottom) {
    display: none;
  }

  .intro {
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
    display: flex;
    flex-direction: column;
    min-width: 0;
    gap: 15px;
  }

  .candidates {
    display: grid;
    grid-template-columns: repeat(2, minmax(0, 1fr));
    gap: 40px;
    min-width: 0;
  }

  .sticky-anchor {
    position: sticky;
    top: 0;
    z-index: 2;
    height: 0;
    margin-bottom: -15px;
  }

  .sticky-top {
    display: flex;
    align-items: center;
    gap: 6px;
    height: 55px;
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

  .sticky-summary {
    flex-shrink: 0;
    font-size: 16px;
    line-height: 1.5;
    letter-spacing: 0.16px;
  }

  .verdict-filter :global(.chips) {
    gap: 0px 15px;
  }

  .verdict-filter :global(button) {
    gap: 5px;
    padding: 0 5px 0 0;
    border: 0;
    border-radius: 0;
    background: transparent;
    color: var(--neutral-gray-800);
    font-size: 16px;
    font-weight: 400;
    line-height: 1.5;
    letter-spacing: 0.8px;
  }

  .verdict-filter :global(.swatch) {
    width: 4px;
    height: 16px;
    border-radius: 1px;
  }

  .verdict-filter :global(button):hover {
    font-weight: 500;
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
    .candidates {
      grid-template-columns: minmax(0, 1fr);
      gap: 25px;
    }
    .results {
      margin-top: 5px;
    }
  }
</style>
