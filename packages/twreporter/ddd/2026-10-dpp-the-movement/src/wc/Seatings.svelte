<script lang="ts">
  import type { ComponentProps } from '@lab-reporter/ddd-shared/components/types.ts'
  import Shell from '@lab-reporter/ddd-shared/components/shared/Shell.svelte'
  import ScrollFade from '@lab-reporter/ddd-shared/components/shared/ScrollFade.svelte'
  import Tooltip from '@lab-reporter/ddd-shared/components/shared/Tooltip.svelte'
  import ChipSelector from '@lab-reporter/ddd-shared/components/shared/ChipSelector.svelte'
  import { createGraphic } from '@lab-reporter/ddd-shared/utils/graphic-data.svelte.ts'
  import { seatingsConfigSchema } from '../lib/components/seatings/types.ts'
  import { buildSeatings } from '../lib/components/seatings/data.ts'

  const props: ComponentProps = $props()
  const graphic = createGraphic(
    'twreporter-seatings',
    seatingsConfigSchema,
    () => props,
  )
  const config = $derived(graphic.config)
  const chart = $derived.by(() => {
    if (!graphic.csv || !config) return { data: undefined, error: undefined }
    try {
      return { data: buildSeatings(graphic.csv, config), error: undefined }
    } catch (error) {
      return {
        data: undefined,
        error: error instanceof Error ? error.message : '資料格式錯誤。',
      }
    }
  })
  let selectedCategory: string | undefined = $state()
  const category = $derived(
    chart.data?.categories.find(
      (category) => category.value === selectedCategory,
    )?.value,
  )
</script>

{#if config && chart.data}
  <Shell
    bind:title={config.title}
    bind:subtitle={config.subtitle}
    bind:footnotes={config.footnotes}
    wide={config.wide}
    backdrop={config.backdrop}
    editable={graphic.editable}
    empty={!chart.data.rows.length}
    emptyMessage="資料中沒有席次。"
  >
    <ChipSelector
      options={chart.data.categories}
      value={category}
      label="類別圖例"
      onchange={(value) => {
        selectedCategory = category === value ? undefined : value
      }}
    />
    {#each chart.data.groups as group}
      <section aria-label={group.label}>
        <div class="section-heading">
          <h2>{group.label}</h2>
          <span
            >{group.count} 人{#if config.focusCategory}，<strong
                >{chart.data.categories.find(
                  (category) => category.value === config.focusCategory,
                )?.label ?? config.focusCategory}
                {group.focusCount} 席</strong
              >，占 {group.focusPercent}%{/if}</span
          >
        </div>
        <ScrollFade>
          <div class="track" style:min-width={group.count * 26 + 'px'}>
            {#each group.sections as section}
              <div
                class="category"
                style:flex={section.seats.length}
                class:dim={category && category !== section.category.value}
              >
                <div
                  class="seats"
                  style:grid-template-columns={'repeat(' +
                    section.seats.length +
                    ', minmax(0, 1fr))'}
                >
                  {#each section.seats as seat}
                    <Tooltip>
                      {#snippet children()}
                        <button
                          type="button"
                          class="seat"
                          style:background={section.category.color}
                          style:color={section.category.textColor}
                          aria-label={`${seat.label}，${seat.category}，${seat.group}${seat.description ? '，' + seat.description : ''}`}
                        >
                          <span>{seat.label}</span>
                        </button>
                      {/snippet}
                      {#snippet content()}
                        <strong>{seat.label}</strong>
                        {#if seat.description}<p>{seat.description}</p>{/if}
                        <p>
                          {seat.category} · {chart.data?.rows
                            .filter((row) => row.label === seat.label)
                            .map((row) => row.group)
                            .join('、')}
                        </p>
                      {/snippet}
                    </Tooltip>
                  {/each}
                </div>
                <div class="category-label" title={section.category.label}>
                  <b>{section.seats.length}</b>
                  {section.category.label}
                </div>
              </div>
            {/each}
          </div>
        </ScrollFade>
      </section>
    {/each}
  </Shell>
{:else}
  <Shell error={chart.error ?? graphic.error} loading={graphic.loading} empty />
{/if}

<style>
  button {
    font: inherit;
    cursor: pointer;
  }
  button:focus-visible {
    outline: 2px solid var(--brand-main);
    outline-offset: 3px;
  }
  .dim {
    opacity: 0.25;
    transition: opacity 0.2s;
  }
  section {
    min-width: 0;
    margin-top: 14px;
  }
  .section-heading {
    display: flex;
    align-items: baseline;
    flex-wrap: wrap;
    gap: 10px;
    margin-bottom: 10px;
  }
  h2 {
    margin: 0;
    font-size: 20px;
    font-weight: 700;
  }
  .section-heading > span {
    font-size: 13px;
    color: var(--neutral-gray-600);
  }
  .section-heading strong {
    color: var(--neutral-gray-800);
  }
  .track {
    display: flex;
    gap: 3px;
  }
  .category {
    min-width: 0;
  }
  .seats {
    display: grid;
    gap: 3px;
  }
  .seat {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 100%;
    height: 80px;
    padding: 0;
    border: 0;
    border-radius: 3px;
  }
  .seat span {
    writing-mode: vertical-rl;
    text-orientation: upright;
    letter-spacing: 2px;
    font-size: 13px;
    font-weight: 600;
    white-space: nowrap;
    color: inherit;
  }
  .category-label {
    overflow: hidden;
    margin-top: 6px;
    padding-top: 4px;
    border-top: 2px solid var(--neutral-gray-200);
    font-size: 12px;
    text-overflow: ellipsis;
    white-space: nowrap;
  }
  p {
    margin: 4px 0 0;
  }
  @media (max-width: 600px) {
    .seat {
      height: 68px;
    }
    h2 {
      font-size: 18px;
    }
  }
</style>
