<script lang="ts">
  import TooltipContent from '@lab-reporter/ddd-shared/components/shared/TooltipContent.svelte'
  import type { InfoBox as InfoBoxData } from '../../rpc.ts'

  const {
    id,
    info,
    onclose,
  }: {
    id: string
    info: InfoBoxData
    onclose: () => void
  } = $props()
</script>

<div {id} class="info-box" role="dialog" aria-labelledby={`${id}-title`}>
  <TooltipContent variant="light">
    <div class="popup-body">
      <button
        type="button"
        class="close"
        onclick={onclose}
        aria-label="關閉資訊">×</button
      >
      <h3 id={`${id}-title`}>{info.infoName}</h3>
      {#if info.inspectItemSequence}
        <p class="item">{info.inspectItemSequence}</p>
      {/if}
      <p class="content">{info.infoContent}</p>
      {#each info.laws as law}
        <p class="source">{law}</p>
      {/each}
    </div>
  </TooltipContent>
</div>

<style>
  .info-box {
    z-index: 1;
    position: absolute;
    position-anchor: --selected-marker;
    position-area: right;
    position-try-fallbacks:
      flip-inline,
      bottom span-all,
      top span-all,
      span-all;
    box-sizing: border-box;
    width: min(320px, calc(100vw - 32px));
    inset: auto;
    max-height: calc(100dvh - 32px);
    margin: 12px;
    padding: 0;
    overflow: visible;
    border: 0;
    background: transparent;
    font-family: inherit;
  }

  .popup-body {
    padding: 10px 12px;
  }

  p {
    margin: 0;
    font-size: 13px;
    line-height: 1.6;
  }

  .close {
    float: right;
    border: 0;
    padding: 0 4px;
    background: transparent;
    color: inherit;
    font-size: 20px;
    line-height: 1;
    cursor: pointer;
  }

  h3 {
    margin: 0 24px 8px 0;
    font-size: 16px;
    line-height: 1.3;
  }

  .item {
    margin-bottom: 12px;
  }

  .content {
    white-space: pre-line;
    color: inherit;
  }

  .source {
    margin-top: 12px;
    white-space: pre-line;
  }
</style>
