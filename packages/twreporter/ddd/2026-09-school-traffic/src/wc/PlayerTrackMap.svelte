<script lang="ts">
  import { createQuery } from '@tanstack/svelte-query'
  import type { Action } from 'svelte/action'
  import type { GetInfoBoxes, GetTrack } from '../lib/rpc.ts'
  import { fontStylesheetUrl } from '@lab-reporter/ddd-shared/utils/fonts.ts'
  import TooltipContent from '@lab-reporter/ddd-shared/components/shared/TooltipContent.svelte'
  import { createTrackPaths } from '../lib/components/player-track-map/track.ts'
  import { trackColors } from '../lib/constants/track.ts'
  import mapImage from '../assets/map.jpg'
  import {
    mapWidth,
    mapHeight,
    projectPosition,
  } from '../lib/constants/coordinate-map.ts'

  const {
    getTrack,
    getInfoBoxes,
  }: {
    getTrack?: GetTrack
    getInfoBoxes?: GetInfoBoxes
    config?: string
  } = $props()
  const id = $props.id()
  let visible = $state(false)
  const observe: Action<HTMLElement> = (node) => {
    const observer = new IntersectionObserver(([entry]) => {
      visible = entry.isIntersecting
    })
    observer.observe(node)
    return { destroy: () => observer.disconnect() }
  }
  const track = createQuery(() => ({
    queryKey: ['player-track', id],
    enabled: visible && !!getTrack,
    queryFn: () => {
      if (!getTrack) throw new Error('The player is not connected')
      return getTrack()
    },
    refetchInterval: 1000,
    refetchIntervalInBackground: false,
    retry: false,
    gcTime: 0,
  }))
  const infoBoxes = createQuery(() => ({
    queryKey: ['player-info-boxes', id],
    enabled: visible && !!getInfoBoxes,
    queryFn: () => {
      if (!getInfoBoxes) throw new Error('The player is not connected')
      return getInfoBoxes()
    },
    staleTime: Infinity,
    gcTime: 0,
  }))
  const markers = $derived(
    (infoBoxes.data ?? []).flatMap((info) => {
      const pixel = projectPosition(info)
      return pixel &&
        pixel.u >= 0 &&
        pixel.u <= mapWidth &&
        pixel.v >= 0 &&
        pixel.v <= mapHeight
        ? [{ info, pixel }]
        : []
    }),
  )
  let selectedId: string | undefined = $state()
  const selected = $derived(
    infoBoxes.data?.find((info) => info.id === selectedId),
  )
  const paths = $derived(createTrackPaths(track.data ?? []))
  const current = $derived.by(() => {
    const last = track.data?.at(-1)
    return last ? projectPosition(last) : undefined
  })
  const error = $derived(track.error?.message ?? infoBoxes.error?.message)
  const loading = $derived(
    (!!getTrack && track.isPending) || (!!getInfoBoxes && infoBoxes.isPending),
  )
</script>

<svelte:head>
  <link rel="stylesheet" href={fontStylesheetUrl} />
</svelte:head>

<section
  use:observe
  style:--map-width={mapWidth}
  style:--map-height={mapHeight}
  aria-busy={loading}
>
  <!-- svelte-ignore a11y_no_noninteractive_tabindex (Keyboard users need to scroll the wide map.) -->
  <div class="map" role="region" aria-label="上學路線地圖" tabindex="0">
    <div class="map-frame">
      <div class="map-content">
        <svg
          width={mapWidth}
          height={mapHeight}
          viewBox={`0 0 ${mapWidth} ${mapHeight}`}
          role="img"
          aria-label="復華七街空拍圖與你的行走路線"
        >
          <image href={mapImage} width={mapWidth} height={mapHeight} />
          {#each paths as path}
            <path
              d={path.d}
              fill="none"
              stroke={trackColors[path.kind]}
              stroke-width="3"
              stroke-linecap="round"
              stroke-linejoin="round"
            />
          {/each}
          {#if current}
            <circle
              cx={current.u}
              cy={current.v}
              r="4"
              fill="#f80b28"
              stroke="white"
              stroke-width="1.5"
            />
          {/if}
        </svg>
        {#each markers as { info, pixel } (info.id)}
          <button
            class="marker"
            style:left={`${(pixel.u / mapWidth) * 100}%`}
            style:top={`${(pixel.v / mapHeight) * 100}%`}
            aria-label={`${info.infoName} ${info.inspectItemSequence}`.trim()}
            aria-haspopup="dialog"
            popovertarget={`${id}-info-box`}
            popovertargetaction="show"
            onclick={() => (selectedId = info.id)}
            ><span aria-hidden="true"></span></button
          >
        {/each}
      </div>
    </div>
  </div>
  <div
    id={`${id}-info-box`}
    class="info-box"
    popover="auto"
    role="dialog"
    aria-labelledby={`${id}-info-title`}
  >
    <TooltipContent variant="light">
      {#if selected}
        <div class="popup-body">
          <button
            class="close"
            popovertarget={`${id}-info-box`}
            popovertargetaction="hide"
            aria-label="關閉資訊">×</button
          >
          <h3 id={`${id}-info-title`}>{selected.infoName}</h3>
          {#if selected.inspectItemSequence}
            <p class="item">{selected.inspectItemSequence}</p>
          {/if}
          <p class="content">{selected.infoContent}</p>
          {#each selected.laws as law}
            <p class="source">{law}</p>
          {/each}
        </div>
      {/if}
    </TooltipContent>
  </div>
  {#if error}
    <p class="notice" role="alert">{error}</p>
  {:else if loading}
    <p class="notice" role="status">資料載入中……</p>
  {:else if !getTrack && !getInfoBoxes}
    <p class="notice" role="status">尚未連接遊戲。</p>
  {/if}
</section>

<style>
  section {
    position: relative;
    width: 100%;
    height: 100vh;
    color: #333;
    font-family: 'Roboto Slab', 'Noto Sans TC', sans-serif;
  }
  .map {
    overflow-x: auto;
    overflow-y: hidden;
    width: 100%;
    height: 100%;
  }
  .map-frame {
    width: max-content;
    height: 100%;
  }
  .map-content {
    position: relative;
    width: max-content;
    height: 100%;
    transform: rotate(180deg);
  }
  svg {
    display: block;
    width: auto;
    height: 100%;
  }
  p {
    margin: 0;
    font-size: 14px;
    line-height: 1.6;
  }
  .notice {
    position: absolute;
    top: 16px;
    left: 16px;
    max-width: calc(100% - 56px);
    padding: 10px 12px;
    border-radius: 6px;
    background: #fffffff2;
  }
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
  .marker span {
    display: grid;
    place-items: center;
    width: 18px;
    height: 18px;
    border: 2px solid white;
    border-radius: 50%;
    background: #175c97;
    color: white;
    font-size: 12px;
    font-weight: 700;
    line-height: 1;
    box-shadow: 0 1px 4px #0006;
    transform: rotate(180deg);
  }
  .marker:focus-visible {
    outline: 2px solid #175c97;
    border-radius: 50%;
  }
  .info-box {
    box-sizing: border-box;
    width: min(320px, calc(100vw - 32px));
    max-height: calc(100dvh - 32px);
    margin: auto;
    padding: 0;
    overflow: visible;
    border: 0;
    background: transparent;
    font-family: inherit;
  }
  .popup-body {
    padding: 10px 12px;
  }
  .popup-body p {
    font-size: 13px;
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
  @media (max-width: 767px) {
    section {
      height: auto;
    }
    .map {
      height: auto;
      overflow: visible;
    }
    .map-frame {
      position: relative;
      width: 100%;
      height: auto;
      aspect-ratio: var(--map-height) / var(--map-width);
      overflow: clip;
    }
    .map-content {
      position: absolute;
      top: 0;
      left: 0;
      width: calc(100% * var(--map-width) / var(--map-height));
      height: calc(100% * var(--map-height) / var(--map-width));
      transform-origin: top left;
      transform: rotate(-90deg) translateX(-100%);
    }
    svg {
      width: 100%;
      height: 100%;
    }
    .marker span {
      transform: rotate(90deg);
    }
  }
</style>
