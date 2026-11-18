<script lang="ts">
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

  let {
    sources,
    config: configUrl = '',
    categoryId,
    topicId = $bindable(''),
    city = $bindable(''),
  }: Partial<ExplorerProps> = $props()
  const graphic = createGraphic(
    'twreporter-card-explorer',
    cardExplorerConfigSchema,
    () => ({ sources, config: configUrl }),
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
      <div class="intro">
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
          {#each candidateNames as name (name)}
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
    max-width: 700px;
    font-weight: 400;
  }

  .explorer :global(.container) {
    border: 0;
  }

  .explorer :global(.frame) {
    padding: 19px 24px 21px 28px;
    gap: 7.5px;
  }

  .explorer :global(.header h1) {
    min-height: 22px;
    font-size: 18px;
    line-height: 1.2;
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
    margin-bottom: 5px;
    min-width: 0;
  }

  .question {
    margin: 0;
    min-height: 34px;
    font-size: 14px;
    line-height: 1.2;
    letter-spacing: 0.01em;
  }

  .results,
  .candidates {
    display: flex;
    flex-direction: column;
    min-width: 0;
  }

  .results {
    gap: 7.5px;
  }

  .candidates {
    gap: 15px;
  }

  .candidates :global(.candidate + .candidate) {
    position: relative;
  }

  .candidates :global(.candidate + .candidate)::before {
    position: absolute;
    top: -7.5px;
    width: 100%;
    height: 0.5px;
    background: repeating-linear-gradient(
      to right,
      var(--neutral-gray-300) 0 2.5px,
      transparent 2.5px 5px
    );
    transform: translateY(-50%);
    content: '';
  }

  .explorer :global(.filter-tabs) {
    --brand-main: var(--brand-heavy);
    --neutral-gray-50: var(--neutral-white);
  }

  .explorer :global(.filter-tabs button) {
    justify-content: flex-start;
    border-color: var(--neutral-gray-300);
    color: var(--neutral-gray-300);
    line-height: 1.5;
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
    font-weight: 600;
  }

  .explorer :global(.topic .chips) {
    gap: 5px;
  }

  .explorer :global(.topic .fade) {
    right: 0;
    width: 30.2885%;
  }

  .explorer :global(.topic button) {
    border-width: 1px;
    padding: 2.5px 10px;
    border-radius: 20px;
    font-size: 12px;
    font-weight: 500;
  }

  .explorer :global(.city) {
    --brand-main: var(--neutral-gray-800);
  }

  .explorer :global(.city .chips) {
    gap: 2.5px;
  }

  .explorer :global(.city button) {
    flex: 1;
    padding: 3px 10px;
    border-width: 0.5px;
    border-radius: 15px;
    font-size: 10px;
  }

  .explorer :global(.filter-tabs button.active) {
    border-width: 0;
  }
</style>
