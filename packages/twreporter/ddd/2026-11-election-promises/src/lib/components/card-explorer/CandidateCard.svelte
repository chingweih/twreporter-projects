<script lang="ts">
  import type { Candidate, CardExplorerConfig, Policy } from './types.ts'
  import PolicyCard from './PolicyCard.svelte'
  import { partyBadges } from './party-badges.ts'

  const {
    candidate,
    policies,
    config,
    editable = false,
    initiallyOpen = false,
  }: {
    candidate: Candidate
    policies: Policy[]
    config: CardExplorerConfig
    editable?: boolean
    initiallyOpen?: boolean
  } = $props()
  const partyBadge = $derived(
    candidate.party ? partyBadges.get(candidate.party) : undefined,
  )
</script>

<section class="candidate" aria-label={candidate.name}>
  <div class="portrait">
    {#if candidate.photo}<img class="photo" src={candidate.photo} alt="" />{/if}
    <div class="identity">
      {#if candidate.number !== undefined}<span class="number"
          >{candidate.number}</span
        >{/if}
      <span class="name">{candidate.name}</span>
    </div>
    {#if partyBadge}<img
        class="party-badge"
        src={partyBadge}
        alt={candidate.party ?? ''}
      />{/if}
  </div>
  <div class="policies">
    {#each policies as policy, index (policy.questionId)}
      <PolicyCard
        {policy}
        {config}
        {editable}
        initiallyOpen={initiallyOpen && index === 0}
      />
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

  .portrait {
    position: sticky;
    top: 0;
    align-self: start;
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
    border: 1.231px solid var(--neutral-gray-800);
    border-radius: 50%;
    background: var(--neutral-white);
    font-size: 24.615px;
    font-weight: 500;
    line-height: 1;
    letter-spacing: 1.2308px;
  }

  .name {
    width: 29px;
    font-size: 28px;
    font-weight: 600;
    line-height: 1.1;
    text-align: center;
    overflow-wrap: anywhere;
  }

  .party-badge {
    position: absolute;
    bottom: 15px;
    left: 10px;
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
</style>
