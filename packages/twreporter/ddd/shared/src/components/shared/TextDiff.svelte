<script lang="ts">
  import { diffChars } from 'diff'

  let {
    full,
    brief,
    showFull = false,
  }: { full: string; brief: string; showFull?: boolean } = $props()

  const diffs = $derived(diffChars(brief, full))
</script>

{#each diffs as diff}
  {#if (diff.added && showFull) || (diff.removed && !showFull) || (!diff.added && !diff.removed)}
    <span class:added={diff.added}>
      {diff.value}
    </span>
  {/if}
{/each}

<style>
  .added {
    animation: slide-in 0.8s cubic-bezier(0.281, 0.246, 0.25, 1) forwards;
  }

  @keyframes slide-in {
    0% {
      letter-spacing: -1em;
      opacity: 0;
    }
    20% {
      opacity: 0;
    }
    50% {
      letter-spacing: normal;
    }
    100% {
      opacity: 1;
    }
  }
</style>
