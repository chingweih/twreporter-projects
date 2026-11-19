<script lang="ts">
  import { getContext } from 'svelte'
  import Shell from '@lab-reporter/ddd-shared/components/shared/Shell.svelte'
  import { createGraphic } from '@lab-reporter/ddd-shared/utils/graphic-data.svelte.ts'
  import {
    cardExplorerConfigSchema,
    type ExplorerProps,
  } from '../lib/components/card-explorer/types.ts'
  import { readPolicies } from '../lib/components/card-explorer/data.ts'
  import FilterTabs from '@lab-reporter/ddd-shared/components/shared/FilterTabs.svelte'
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
  const activeCity = $derived(city || cities[0]?.value || '')
  const visiblePolicies = $derived(
    categoryPolicies.filter(
      (policy) =>
        topic &&
        policy.questionId.startsWith(topic.id) &&
        policy.city === activeCity,
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
      <div class="intro">
        {#if topic && (topic.question || graphic.editable)}<p class="question">
            <EditableText
              bind:value={topic.question}
              editable={graphic.editable}
              placeholder="題目文字"
            />
          </p>{/if}
      </div>
      <div class="results">
        <FilterTabs
          class="city"
          options={cities}
          value={activeCity}
          label="縣市"
          onchange={(value) => (city = value)}
        />
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
    padding: 7px 14px;
    border-radius: 40px;
    font-size: 14px;
    font-weight: 500;
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
    padding: 10px 12px;
    border-width: 1px;
    border-radius: 0;
    font-size: 16px;
    font-weight: 400;
    transition: all 0.1s ease-in-out;
  }
</style>
