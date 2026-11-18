<script lang="ts">
  import type { Candidate, CardExplorerConfig, Policy } from './types.ts'
  import PolicyCard from './PolicyCard.svelte'

  const {
    candidate,
    policies,
    config,
    editable = false,
  }: {
    candidate: Candidate
    policies: Policy[]
    config: CardExplorerConfig
    editable?: boolean
  } = $props()
</script>

<section class="candidate" aria-label={candidate.name}>
  <div class="portrait-placeholder" aria-hidden={!candidate.photo}>
    {#if candidate.photo}<img src={candidate.photo} alt={candidate.name} />{/if}
  </div>
  <div class="policies">
    {#each policies as policy, index (policy.questionId)}
      <PolicyCard {policy} {config} {editable} initiallyOpen={index === 0} />
    {/each}
  </div>
</section>

<style>
  .candidate {
    display: grid;
    grid-template-columns: 111px minmax(0, 1fr);
    gap: 5.5px;
  }

  .portrait-placeholder {
    align-self: start;
    height: 125px;
    background: #d9d9d9;
  }

  .policies {
    display: flex;
    flex-direction: column;
    gap: 5.5px;
    min-width: 0;
  }

  img {
    display: block;
    width: 100%;
    height: 100%;
    object-fit: cover;
  }
</style>
