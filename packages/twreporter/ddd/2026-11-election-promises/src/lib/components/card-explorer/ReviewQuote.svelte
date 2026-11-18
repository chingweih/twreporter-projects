<script lang="ts">
  import type { Review, Verdict } from './types.ts'
  import EditableText from '@lab-reporter/ddd-shared/components/shared/EditableText.svelte'
  const {
    review,
    verdict,
    editable = false,
  }: { review: Review; verdict?: Verdict; editable?: boolean } = $props()
</script>

<blockquote>
  <p>
    <EditableText
      bind:value={review.csvRow.analysis}
      {editable}
      placeholder={editable ? '評析內容' : ''}
    />
  </p>
  <footer>
    {#if verdict}<span class="badge" style:background={verdict.color}
        >{verdict.label}</span
      >{/if}
    <cite><EditableText bind:value={review.csvRow.source} {editable} /></cite>
  </footer>
</blockquote>

<style>
  blockquote {
    display: flex;
    flex-direction: column;
    gap: 7px;
    margin: 0;
    padding: 10px;
    background: var(--neutral-white);
    color: var(--neutral-gray-700);
    font-size: 16px;
    font-weight: 400;
    line-height: 1.5;
    letter-spacing: 0.05em;
    white-space: pre-line;
  }
  p {
    margin: 0;
    font-size: 16px;
  }
  footer {
    display: flex;
    align-items: center;
    gap: 10px;
  }
  .badge {
    flex-shrink: 0;
    border-radius: 2px;
    padding: 1px 5px;
    color: var(--neutral-white);
    font-size: 12px;
    font-weight: 500;
    letter-spacing: 0.05em;
  }
  cite {
    color: var(--neutral-gray-500);
    font-size: 14px;
    font-style: normal;
    letter-spacing: 0.05em;
    overflow-wrap: anywhere;
  }
</style>
