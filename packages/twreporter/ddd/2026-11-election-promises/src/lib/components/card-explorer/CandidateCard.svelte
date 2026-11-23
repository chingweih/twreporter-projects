<script lang="ts">
  import type { Candidate, CardExplorerConfig, Policy } from './types.ts'
  import PolicyCard from './PolicyCard.svelte'
  import { partyBadges } from './party-badges.ts'
  import { resolveCandidatePhoto } from './candidate-photos.ts'

  const {
    candidate,
    policies,
    config,
    editable = false,
    comparison = false,
    banner = false,
    expanded = false,
    questionLabels,
    onexpand,
  }: {
    candidate: Candidate
    policies: Policy[]
    config: CardExplorerConfig
    editable?: boolean
    comparison?: boolean
    banner?: boolean
    expanded?: boolean
    questionLabels?: ReadonlyMap<Policy['questionId'], string>
    onexpand?: (trigger: HTMLButtonElement) => void
  } = $props()
  const partyBadge = $derived(
    candidate.party ? partyBadges.get(candidate.party) : undefined,
  )
  const textMode = $derived(
    expanded ? 'full' : onexpand ? 'excerpt' : 'expandable',
  )
</script>

<section
  class="candidate"
  class:banner
  class:expanded
  aria-label={candidate.name}
>
  <div class="candidate-heading" class:click-through={Boolean(onexpand)}>
    <div
      class="portrait"
      class:kmt={candidate.party === '國民黨'}
      class:dpp={candidate.party === '民進黨'}
    >
      {#if candidate.photo}
        <img
          class="photo"
          src={resolveCandidatePhoto(
            banner ? candidate.photo.mobile : candidate.photo.desktop,
          )}
          alt=""
        />
      {/if}
      <div class="identity">
        {#if candidate.number !== undefined}<span class="number"
            >{candidate.number}</span
          >{/if}
        <span class="name">{candidate.name}</span>
      </div>
      {#if candidate.party}<div class="party">
          {#if partyBadge}<img
              class="party-badge"
              src={partyBadge}
              alt={candidate.party}
            />{/if}
          <span class="party-name">{candidate.party}</span>
        </div>{/if}
    </div>
  </div>
  <div class="policies">
    {#each policies as policy (policy.questionId)}
      <PolicyCard
        {policy}
        {config}
        {editable}
        compact={comparison}
        inlineReviews={banner || expanded}
        {textMode}
        questionLabel={questionLabels?.get(policy.questionId)}
      />
    {/each}
  </div>
  {#if onexpand}
    <button
      type="button"
      class="open-card"
      aria-label={`展開${candidate.name}政見全文`}
      aria-haspopup="dialog"
      onclick={(event) => onexpand?.(event.currentTarget)}
    ></button>
  {/if}
</section>

<style>
  .candidate {
    position: relative;
    isolation: isolate;
    display: grid;
    grid-template-columns: 200px minmax(0, 1fr);
    gap: 11px;
    min-width: 0;
  }

  .expanded .candidate-heading {
    position: static;
  }

  .candidate.expanded {
    grid-template-rows: minmax(0, 1fr);
  }

  .expanded .policies {
    min-height: 0;
    overflow: auto;
    overscroll-behavior: contain;
  }

  .open-card {
    position: absolute;
    inset: 0;
    z-index: 1;
    padding: 0;
    border: 0;
    border-radius: 2px;
    background: transparent;
    cursor: pointer;
  }

  .open-card:focus-visible {
    outline: 2px solid var(--brand-heavy);
    outline-offset: 3px;
  }

  .candidate-heading {
    position: sticky;
    top: calc(var(--site-header-offset, 0px) + var(--sticky-top-height, 0px));
    display: flex;
    flex-direction: column;
    gap: 10px;
    align-self: start;
    transition: top var(--site-header-transition, 0s);
  }

  .portrait {
    position: relative;
    height: 260px;
    background: var(--neutral-gray-100);
  }

  .candidate-heading.click-through {
    pointer-events: none;
  }

  .identity {
    position: absolute;
    top: 0;
    left: 0;
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 5px;
    padding: 10px 10px 0;
    color: var(--neutral-gray-800);
  }

  .number {
    display: grid;
    place-items: center;
    width: 32px;
    height: 32px;
    border: 1px solid var(--neutral-gray-800);
    border-radius: 50%;
    background: var(--neutral-white);
    font-size: 24px;
    font-weight: 500;
    line-height: 1;
  }

  .name {
    width: 29px;
    font-size: 28px;
    font-weight: 600;
    line-height: 1.1;
    text-align: center;
    overflow-wrap: anywhere;
  }

  .party {
    position: absolute;
    display: flex;
    align-items: center;
    bottom: 15px;
    left: 10px;
  }

  .party-name {
    display: none;
  }

  .party-badge {
    width: 32px;
    height: 32px;
    border-radius: 50%;
    object-fit: cover;
    outline: 1px solid var(--neutral-white);
    outline-offset: -1px;
    box-shadow: 0 0 2px rgb(0 0 0 / 20%);
  }

  .policies {
    display: flex;
    flex-direction: column;
    gap: 15px;
    min-width: 0;
  }

  .photo {
    display: block;
    width: 100%;
    height: 100%;
    object-fit: cover;
  }

  .candidate.banner {
    grid-template-columns: minmax(0, 1fr);
    align-content: start;
  }
  .candidate.banner.expanded {
    grid-template-rows: auto minmax(0, 1fr);
  }
  .banner .candidate-heading {
    z-index: 3;
  }
  .banner .portrait {
    height: 81px;
    border-radius: 1px;
    overflow: hidden;
    background: var(--banner-background, var(--neutral-gray-100));
  }
  .banner .portrait.kmt {
    --banner-background: #dae6ed;
    --party-color: #517399;
  }
  .banner .portrait.dpp {
    --banner-background: #e1e9d0;
    --party-color: #667d45;
  }
  .banner .identity {
    flex-direction: row;
  }
  .banner .name {
    width: auto;
    white-space: nowrap;
    letter-spacing: 0.6px;
    -webkit-text-stroke: 2px var(--banner-background, var(--neutral-gray-100));
    paint-order: stroke fill;
  }
  .banner .party {
    gap: 3px;
    bottom: 8px;
    left: 12px;
    color: var(--party-color, var(--neutral-gray-700));
  }
  .banner .party-badge {
    width: 16px;
    height: 16px;
  }
  .banner .party-name {
    display: inline;
    font-size: 14px;
    font-weight: 500;
    letter-spacing: 0.6px;
  }
</style>
