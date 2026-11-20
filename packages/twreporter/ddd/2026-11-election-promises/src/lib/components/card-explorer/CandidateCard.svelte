<script lang="ts">
  import type { Snippet } from 'svelte'
  import type { Candidate, CardExplorerConfig, Policy } from './types.ts'
  import PolicyCard from './PolicyCard.svelte'
  import { partyBadges } from './party-badges.ts'
  import { resolveCandidatePhoto } from './candidate-photos.ts'
  import { breakpoints } from '@lab-reporter/ddd-shared/utils/media-query.ts'

  const {
    candidate,
    policies,
    config,
    editable = false,
    footnotes,
  }: {
    candidate: Candidate
    policies: Policy[]
    config: CardExplorerConfig
    editable?: boolean
    footnotes?: Snippet
  } = $props()
  const partyBadge = $derived(
    candidate.party ? partyBadges.get(candidate.party) : undefined,
  )
</script>

<section class="candidate" aria-label={candidate.name}>
  <div class="candidate-heading">
    <div
      class="portrait"
      class:kmt={candidate.party === '國民黨'}
      class:dpp={candidate.party === '民進黨'}
    >
      {#if candidate.photo}
        <picture>
          <source
            media={`(width < ${breakpoints.tablet}px)`}
            srcset={resolveCandidatePhoto(candidate.photo.mobile)}
          />
          <img
            class="photo"
            src={resolveCandidatePhoto(candidate.photo.desktop)}
            alt=""
          />
        </picture>
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
    {@render footnotes?.()}
  </div>
  <div class="policies">
    {#each policies as policy (policy.questionId)}
      <PolicyCard {policy} {config} {editable} />
    {/each}
  </div>
</section>

<style>
  .candidate {
    display: grid;
    grid-template-columns: 200px minmax(0, 1fr);
    gap: 11px;
    min-width: 0;
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
  @media (width < 768px) {
    .candidate {
      grid-template-columns: minmax(0, 1fr);
    }
    .candidate-heading {
      z-index: 1;
    }
    .portrait {
      height: 81px;
      border-radius: 1px;
      overflow: hidden;
    }
    .portrait.kmt {
      background: #dae6ed;
      --party-color: #517399;
    }
    .portrait.dpp {
      background: #e1e9d0;
      --party-color: #667d45;
    }
    .identity {
      flex-direction: row;
    }
    .name {
      width: auto;
      white-space: nowrap;
      letter-spacing: 0.6px;
    }
    .party {
      gap: 3px;
      bottom: 8px;
      left: 12px;
      color: var(--party-color, var(--neutral-gray-700));
    }
    .party-badge {
      width: 16px;
      height: 16px;
    }
    .party-name {
      display: inline;
      font-size: 14px;
      font-weight: 500;
      letter-spacing: 0.6px;
    }
  }
</style>
