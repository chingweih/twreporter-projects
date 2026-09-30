<script lang="ts">
  import type { ComponentProps } from '@lab-reporter/ddd-shared/components/types.ts'
  import Shell from '@lab-reporter/ddd-shared/components/shared/Shell.svelte'
  import Tooltip from '@lab-reporter/ddd-shared/components/shared/Tooltip.svelte'
  import ChipSelector from '@lab-reporter/ddd-shared/components/shared/ChipSelector.svelte'
  import { createGraphic } from '@lab-reporter/ddd-shared/utils/graphic-data.svelte.ts'
  import { detailedBarChartConfigSchema } from '../lib/components/detailed-bar-chart/types.ts'
  import { buildDetailedBarChart } from '../lib/components/detailed-bar-chart/data.ts'

  const props: ComponentProps = $props()
  const graphic = createGraphic(
    'twreporter-detailed-bar-chart',
    detailedBarChartConfigSchema,
    () => props,
  )
  const config = $derived(graphic.config)
  const chart = $derived.by(() => {
    if (!graphic.csv || !config) return { data: undefined, error: undefined }
    try {
      return {
        data: buildDetailedBarChart(graphic.csv, config),
        error: undefined,
      }
    } catch (error) {
      return {
        data: undefined,
        error: error instanceof Error ? error.message : '資料格式錯誤。',
      }
    }
  })
  let selectedFilter: string | undefined = $state()
  let selectedGroup: string | undefined = $state()
  const filter = $derived(
    chart.data?.filters.find((filter) => filter.value === selectedFilter) ??
      chart.data?.filters[0],
  )
  const group = $derived(
    filter?.groups.find((group) => group.value === selectedGroup) ??
      filter?.groups[0],
  )
  const donations = $derived(group?.donations ?? [])
  const total = $derived(donations.reduce((sum, row) => sum + row.amount, 0))
  const highlighted = $derived(
    donations
      .filter((row) => row.highlighted)
      .reduce((sum, row) => sum + row.amount, 0),
  )
  const percent = $derived(total ? (highlighted / total) * 100 : 0)
  const otherRows = $derived(donations.filter((row) => !row.highlighted))
  const breakdown = $derived(
    [...new Set(otherRows.map((row) => row.breakdown))]
      .map((label) => ({
        label,
        amount: otherRows
          .filter((row) => row.breakdown === label)
          .reduce((sum, row) => sum + row.amount, 0),
      }))
      .sort((a, b) => b.amount - a.amount),
  )
  const numberFormat = new Intl.NumberFormat('zh-TW', {
    maximumFractionDigits: 1,
  })
</script>

{#snippet amount(value: number)}{numberFormat.format(value / 10000)}
  萬元{/snippet}

{#snippet details(records: NonNullable<typeof group>['donations'])}
  <table class="detail-table">
    <thead><tr><th>企業／群組</th><th>明細</th><th>金額</th></tr></thead>
    <tbody>
      {#each records as record}
        <tr
          ><td
            >{filter?.groups.find((group) => group.value === record.group)
              ?.label ?? record.group}</td
          ><td>{record.detail}</td><td class="number"
            >{@render amount(record.amount)}</td
          ></tr
        >
      {/each}
    </tbody>
  </table>
{/snippet}

{#if config && chart.data && filter}
  <Shell
    bind:title={config.title}
    bind:subtitle={config.subtitle}
    bind:footnotes={config.footnotes}
    wide={config.wide}
    backdrop={config.backdrop}
    editable={graphic.editable}
    empty={!filter.groups.length}
    emptyMessage="此範圍沒有捐款資料。"
  >
    {#if chart.data.filters.length > 1}<div
        class="filters"
        aria-label="資料篩選"
      >
        {#each chart.data.filters as item}
          <button
            type="button"
            class:active={filter.value === item.value}
            aria-pressed={filter.value === item.value}
            onclick={() => {
              selectedFilter = item.value
              selectedGroup = undefined
            }}>{item.label}</button
          >
        {/each}
      </div>{/if}
    {#if filter.groups.length}
      {#if filter.groups.length > 1}<ChipSelector
          options={filter.groups.map((item) => ({
            value: item.value,
            label: item.label,
            count: item.recipients.size,
          }))}
          value={group?.value}
          label="企業／群組"
          variant="selector"
          countUnit="位"
          countColor={config.highlight.color}
          onchange={(value) => {
            selectedGroup = value
          }}
        />{/if}
      <div
        class="bars"
        style:--highlight={config.highlight.color}
        style:--remainder={config.remainder.color}
      >
        <div class="bar-heading">
          <strong>{group?.label}</strong><span
            >{filter.label ? `在${filter.label}的` : ''}捐款 {@render amount(
              total,
            )}</span
          >
        </div>
        <div
          class="stack"
          role="img"
          aria-label={`${config.highlight.label} ${Math.round(percent)}%，${config.remainder.label} ${Math.round(100 - percent)}%`}
        >
          {#if highlighted > 0}<div class="key" style:width={percent + '%'}>
              <span>{Math.round(percent)}%</span>
            </div>{/if}
          {#if total - highlighted > 0}<div
              class="other"
              style:width={100 - percent + '%'}
            >
              <span>{Math.round(100 - percent)}%</span>
            </div>{/if}
        </div>
        <div class="stack-labels">
          <span class="key-label"
            >{config.highlight.label} <b>{@render amount(highlighted)}</b></span
          >
          <Tooltip>
            {#snippet children()}<button type="button" class="breakdown-label"
                >{config.remainder.label}
                <b>{@render amount(total - highlighted)}</b></button
              >{/snippet}
            {#snippet content()}
              <strong>{config.remainder.label}</strong>
              {#if breakdown.length}{#each breakdown as item}<p>
                    {item.label}：{@render amount(item.amount)}
                  </p>{/each}{:else}<p>目前資料沒有此類別的紀錄。</p>{/if}
            {/snippet}
          </Tooltip>
        </div>
        {#each config.descriptions.filter((note) => note.group === group?.value && note.filter === filter.value) as note}
          <p class="bar-description">{note.text}</p>
        {/each}
      </div>
      <div class="roster-heading">
        <h2>{group?.label}捐給哪些{config.cardFilter.label}</h2>
        <p>有底色代表有收到這家企業的捐款</p>
      </div>
      {#each filter.sections as section}
        <section aria-label={section.label || '捐款名單'}>
          {#if section.label}<h3>{section.label}</h3>{/if}
          <div class="roster" style:--highlight={config.highlight.color}>
            {#each section.candidates as item}
              {@const records = item.donations.filter(
                (row) => row.group === group?.value,
              )}
              {@const sum = records.reduce((sum, row) => sum + row.amount, 0)}
              <Tooltip>
                {#snippet children()}
                  <button
                    type="button"
                    class="card"
                    class:on={sum > 0}
                    class:off={sum === 0}
                    aria-label={`${item.label}，${item.descriptions.join('、')}，${numberFormat.format(sum / 10000)} 萬元`}
                  >
                    <strong>{item.label}</strong>
                    <span class="description"
                      >{item.details.join(' · ') ||
                        item.descriptions.join(' · ')}</span
                    >
                    <span class="amount"
                      >{#if sum > 0}{@render amount(sum)}{:else}—{/if}</span
                    >
                  </button>
                {/snippet}
                {#snippet content()}
                  <strong>{item.label}</strong>
                  <p>{item.descriptions.join('、')}</p>
                  {#if records.length}{@render details(records.slice(0, 5))}
                    {#if records.length > 5}<p>
                        另有 {records.length - 5} 筆明細。
                      </p>{/if}
                  {:else}<p>沒有收到所選企業的捐款。</p>{/if}
                {/snippet}
              </Tooltip>
            {/each}
          </div>
        </section>
      {/each}
      {#if !filter.roster.length}<p class="empty" role="status">
          此範圍沒有符合卡片篩選條件的名單。
        </p>{/if}
    {:else}
      <p class="empty" role="status">此範圍沒有捐款資料。</p>
    {/if}
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
  .filters {
    display: flex;
    flex-wrap: wrap;
    align-self: flex-start;
    border: 1px solid var(--neutral-gray-200);
    border-radius: 6px;
    overflow: hidden;
    background: var(--neutral-white);
  }
  .filters button {
    padding: 7px 16px;
    border: 0;
    background: transparent;
    font-size: 14px;
  }
  .filters button.active {
    background: var(--brand-main);
    color: var(--neutral-white);
  }
  .bars {
    min-width: 0;
    padding: 14px 16px;
    border: 1px solid var(--neutral-gray-200);
    border-radius: 8px;
    background: var(--neutral-white);
  }
  .bar-heading {
    display: flex;
    flex-wrap: wrap;
    align-items: baseline;
    gap: 8px;
    margin-bottom: 10px;
    font-size: 15px;
  }
  .bar-heading > span {
    color: var(--neutral-gray-600);
    font-size: 13px;
  }
  .stack {
    display: flex;
    height: 30px;
    overflow: hidden;
    border-radius: 4px;
  }
  .key,
  .other {
    display: flex;
    align-items: center;
    min-width: 0;
    overflow: hidden;
    transition: width 0.3s;
    font-size: 13px;
  }
  .key {
    justify-content: flex-end;
    background: var(--highlight);
    color: var(--neutral-white);
  }
  .key span,
  .other span {
    padding: 0 8px;
    color: inherit;
    white-space: nowrap;
  }
  .other {
    background: var(--remainder);
  }
  .stack-labels {
    display: flex;
    justify-content: space-between;
    flex-wrap: wrap;
    gap: 8px;
    margin-top: 6px;
    font-size: 13px;
  }
  .key-label {
    color: var(--highlight);
  }
  .bar-description {
    margin-top: 10px;
    color: var(--neutral-gray-600);
    font-size: 12px;
    white-space: pre-line;
  }
  .breakdown-label {
    padding: 0;
    border: 0;
    background: transparent;
    font-size: inherit;
    color: var(--neutral-gray-600);
    text-align: right;
  }
  .roster-heading {
    display: flex;
    flex-wrap: wrap;
    justify-content: space-between;
    align-items: baseline;
    gap: 6px;
  }
  h2 {
    margin: 0;
    font-size: 15px;
  }
  .roster-heading p {
    color: var(--neutral-gray-600);
    font-size: 12px;
  }
  section + section {
    padding-top: 14px;
    border-top: 1px solid var(--neutral-gray-200);
  }
  h3 {
    margin: 0 0 8px;
    font-size: 13px;
    color: var(--neutral-gray-600);
  }
  .roster {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(118px, 1fr));
    gap: 8px;
  }
  .card {
    display: flex;
    flex-direction: column;
    width: 100%;
    height: 100%;
    min-height: 90px;
    padding: 10px;
    border: 1px solid var(--neutral-gray-200);
    border-radius: 6px;
    background: var(--neutral-white);
    text-align: left;
    transition:
      opacity 0.2s,
      background 0.2s;
  }
  .card strong {
    font-size: 14px;
    color: inherit;
  }
  .description {
    margin-top: 3px;
    font-size: 11px;
    line-height: 1.5;
    color: var(--neutral-gray-600);
  }
  .amount {
    margin-top: auto;
    padding-top: 6px;
    font-size: 13px;
    font-variant-numeric: tabular-nums;
    color: inherit;
  }
  .card.on {
    background: var(--highlight);
    border-color: var(--highlight);
    color: var(--neutral-white);
  }
  .card.on .description {
    color: var(--chart-mint-1);
  }
  .card.off {
    opacity: 0.5;
  }
  .detail-table {
    width: 100%;
    margin-top: 6px;
    border-collapse: collapse;
    font-size: 12px;
  }
  .detail-table th,
  .detail-table td {
    padding: 4px 8px 4px 0;
    text-align: left;
    vertical-align: top;
  }
  .detail-table td.number {
    text-align: right;
    white-space: nowrap;
    font-variant-numeric: tabular-nums;
  }
  p {
    margin: 4px 0 0;
  }
  .empty {
    font-size: 14px;
  }
  @media (max-width: 600px) {
    .roster {
      grid-template-columns: repeat(auto-fill, minmax(96px, 1fr));
    }
  }
</style>
