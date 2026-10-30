<script lang="ts">
  import type { projectPosition } from '../../constants/coordinate-map.ts'
  import { mapHeight, mapWidth } from '../../constants/coordinate-map.ts'
  import type { InfoBox } from '../../rpc.ts'

  const {
    info,
    pixel,
    selected = false,
    highlighted = false,
    edit = false,
    infoBoxId,
    onselect,
  }: {
    info: InfoBox
    pixel: NonNullable<ReturnType<typeof projectPosition>>
    selected?: boolean
    highlighted?: boolean
    edit?: boolean
    infoBoxId: string
    onselect: () => void
  } = $props()
</script>

<button
  type="button"
  class="marker"
  class:selected
  class:highlighted
  style:left={`${(pixel.u / mapWidth) * 100}%`}
  style:top={`${(pixel.v / mapHeight) * 100}%`}
  aria-label={`${info.infoName} ${info.inspectItemSequence}`.trim()}
  aria-haspopup="dialog"
  aria-expanded={selected}
  aria-controls={selected ? infoBoxId : undefined}
  onclick={onselect}
>
  <span class="marker-content" aria-hidden="true">
    <span class="dot"></span>
    {#if edit}
      <span class="marker-id">{info.zoneId}</span>
    {/if}
  </span>
</button>

<style>
  .marker {
    position: absolute;
    transform: translate(-50%, -50%);
    display: grid;
    place-items: center;
    width: 28px;
    height: 28px;
    border: 0;
    padding: 0;
    background: transparent;
    cursor: pointer;
  }

  .marker-content {
    position: relative;
    display: grid;
    place-items: center;
    transform: rotate(180deg);
  }

  .dot {
    width: 18px;
    height: 18px;
    border: 2px solid white;
    border-radius: 50%;
    background: #175c97;
    box-shadow: 0 1px 4px #0006;
  }

  .marker:focus-visible {
    outline: 2px solid #175c97;
    border-radius: 50%;
  }

  .marker.highlighted .dot {
    background: #d73027;
  }

  .marker.highlighted:focus-visible {
    outline-color: #d73027;
  }

  .marker.selected {
    anchor-name: --selected-marker;
  }

  .marker-id {
    position: absolute;
    top: 50%;
    left: calc(100% + 8px);
    transform: translateY(-50%);
    width: max-content;
    padding: 3px 6px;
    border-radius: 2px;
    background: white;
    color: #333;
    font: 12px monospace;
    user-select: text;
  }

  @media (max-width: 767px) {
    .marker-content {
      transform: rotate(90deg);
    }
  }
</style>
