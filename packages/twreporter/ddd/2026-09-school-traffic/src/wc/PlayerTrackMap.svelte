<script lang="ts">
  import TooltipContent from '@lab-reporter/ddd-shared/components/shared/TooltipContent.svelte'
  import Frame from '@lab-reporter/ddd-shared/components/shared/Frame.svelte'
  import Logo from '@lab-reporter/ddd-shared/components/shared/Logo.svelte'
  import { createQuery } from '@tanstack/svelte-query'
  import type { Action } from 'svelte/action'
  import mapImage from '../assets/map.jpg'
  import { createTrackPaths } from '../lib/components/player-track-map/track.ts'
  import {
    mapHeight,
    mapWidth,
    projectPosition,
  } from '../lib/constants/coordinate-map.ts'
  import { trackColors } from '../lib/constants/track.ts'
  import type { GetInfoBoxes, GetTrack, PlayerTrack } from '../lib/rpc.ts'

  const {
    getTrack,
    getInfoBoxes,
  }: {
    getTrack?: GetTrack
    getInfoBoxes?: GetInfoBoxes
    config?: string
  } = $props()
  const id = $props.id()
  let view = $state<'before' | 'after'>('before')
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
  let infoBox: HTMLDivElement | undefined = $state()
  const selected = $derived(
    infoBoxes.data?.find((info) => info.id === selectedId),
  )
  const paths = $derived(createTrackPaths(track.data ?? []))
  const legend = $derived.by(() => {
    const lengths = { road: 0, shoulder: 0, safe: 0 }
    let previous: PlayerTrack[number] | undefined

    for (const point of track.data ?? []) {
      if (previous?.segment === point.segment) {
        lengths[previous.kind] += Math.hypot(
          point.x - previous.x,
          point.z - previous.z,
        )
      }
      previous = point
    }

    const total = lengths.road + lengths.shoulder + lengths.safe
    return [
      { label: '車道', color: trackColors.road, length: lengths.road },
      { label: '路肩', color: trackColors.shoulder, length: lengths.shoulder },
      { label: '安全區域', color: trackColors.safe, length: lengths.safe },
    ].map(({ label, color, length }) => ({
      label,
      color,
      percentage: total > 0 ? (length / total) * 100 : null,
    }))
  })
  const current = $derived.by(() => {
    const last = track.data?.at(-1)
    return last ? projectPosition(last) : undefined
  })
  const loading = $derived(
    (!!getTrack && track.isPending) || (!!getInfoBoxes && infoBoxes.isPending),
  )
</script>

<svelte:window
  onpointerup={(event) => {
    if (infoBox && !event.composedPath().includes(infoBox)) {
      selectedId = undefined
    }
  }}
  onkeydown={(event) => {
    if (event.key === 'Escape') selectedId = undefined
  }}
/>

<section
  use:observe
  style:--map-width={mapWidth}
  style:--map-height={mapHeight}
  aria-busy={loading}
>
  <div class="graph-frame">
    <Frame>
      {#snippet topLeft()}
        <div class="card">
          <h1>看看你剛剛的上學路徑，在改善後可以多安全？</h1>
        </div>
      {/snippet}
      <div class="graph-control-container">
        <div class="graph-controls">
          <div class="card legend">
            <h2>路徑長度占比</h2>
            <dl>
              {#each legend as item (item.label)}
                <div class="legend-row">
                  <dt>
                    <span
                      class="legend-swatch"
                      style:background-color={item.color}
                    ></span>
                    {item.label}
                  </dt>
                  <dd>
                    {item.percentage === null
                      ? '未記錄'
                      : `${item.percentage.toFixed(1)}%`}
                  </dd>
                </div>
              {/each}
            </dl>
          </div>
          <div class="card view-tabs" role="group" aria-label="道路改善前後">
            <button
              type="button"
              aria-pressed={view === 'before'}
              onclick={() => (view = 'before')}>現況</button
            >
            <button
              type="button"
              aria-pressed={view === 'after'}
              onclick={() => (view = 'after')}>改善建議</button
            >
          </div>
        </div>
      </div>
      {#snippet bottomLeft()}
        <div class="card">
          <p>註：改善建議為設計影像</p>
          <p>資料整理：林雨佑 ｜ 攝影：謝佩穎 ｜ 設計：江世民</p>
        </div>
      {/snippet}
      {#snippet bottomRight()}
        <Logo />
      {/snippet}
    </Frame>
  </div>
  <div class="map" role="region" aria-label="上學路線地圖">
    <div class="map-frame">
      <div class="map-content">
        <svg
          width={mapWidth}
          height={mapHeight}
          viewBox={`0 0 ${mapWidth} ${mapHeight}`}
          role="img"
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
            class:selected={selectedId === info.id}
            style:left={`${(pixel.u / mapWidth) * 100}%`}
            style:top={`${(pixel.v / mapHeight) * 100}%`}
            aria-label={`${info.infoName} ${info.inspectItemSequence}`.trim()}
            aria-haspopup="dialog"
            aria-expanded={selectedId === info.id}
            aria-controls={selectedId === info.id
              ? `${id}-info-box`
              : undefined}
            onclick={() => (selectedId = info.id)}
            ><span aria-hidden="true"></span></button
          >
        {/each}
      </div>
    </div>
  </div>
  {#if selected}
    <div
      id={`${id}-info-box`}
      class="info-box"
      bind:this={infoBox}
      role="dialog"
      aria-labelledby={`${id}-info-title`}
    >
      <TooltipContent variant="light">
        <div class="popup-body">
          <button
            class="close"
            onclick={() => (selectedId = undefined)}
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
      </TooltipContent>
    </div>
  {/if}
</section>

<style>
  section {
    --bottom-bar-height: 0px;
    anchor-scope: --selected-marker;
    isolation: isolate;
    box-sizing: border-box;
    position: relative;
    width: 100%;
    height: calc(100dvh - 64px - var(--bottom-bar-height));
    color: #333;
    font-family: 'Roboto Slab', 'Noto Sans TC', sans-serif;
  }

  .map {
    z-index: 0;
    overflow-x: auto;
    overflow-y: hidden;
    width: 100%;
    height: 100%;
    position: relative;
  }

  .graph-frame {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    z-index: 10;
    pointer-events: none;
  }

  .card {
    background-color: #242424;
    padding: 10px 15px;
    color: var(--neutral-white);

    h1 {
      font-size: 24px;
      font-weight: 600;
    }

    p {
      font-size: 12px;
      font-weight: 300;
    }
  }

  .graph-control-container {
    width: 100%;
    height: 100%;
    display: flex;
    justify-content: space-between;
    align-items: start;
  }

  .graph-controls {
    width: 100%;
    position: sticky;
    padding: 10px 0;
    display: flex;
    justify-content: space-between;
    align-items: start;
    gap: 16px;
    top: 0;
  }

  .legend {
    width: 180px;
    max-width: 65%;
    font-size: var(--text-xs);
  }

  .legend h2 {
    margin: 0 0 12px;
    font-size: inherit;
    font-weight: 600;
  }

  .legend dl {
    display: flex;
    flex-direction: column;
    gap: 10px;
    margin: 0;
  }

  .legend-row {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 12px;
  }

  .legend dt {
    display: flex;
    align-items: center;
    gap: 8px;
  }

  .legend dd {
    margin: 0;
    font-variant-numeric: tabular-nums;
    font-weight: 600;
  }

  .legend-swatch {
    width: 14px;
    height: 3px;
    border-radius: 2px;
    flex-shrink: 0;
  }

  .view-tabs {
    display: flex;
    flex-direction: column;
    flex-shrink: 0;
    overflow: hidden;
    padding: 0;
    border-radius: 4px;
  }

  .view-tabs button {
    min-height: 48px;
    padding: 25px 6px;
    border: 0;
    background: transparent;
    color: inherit;
    font: inherit;
    font-size: var(--text-s);
    writing-mode: vertical-rl;
    text-orientation: upright;
    text-align: center;
    cursor: pointer;
    pointer-events: auto;
  }

  .view-tabs button + button {
    border-top: 1px solid var(--neutral-gray-600);
  }

  .view-tabs button[aria-pressed='true'] {
    background: var(--neutral-white);
    color: var(--neutral-gray-900);
    font-weight: 600;
  }

  .view-tabs button:focus-visible {
    outline: 2px solid var(--neutral-gray-400);
    outline-offset: -3px;
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
  .marker.selected {
    anchor-name: --selected-marker;
  }
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
    max-height: calc(100dvh - 64px - var(--bottom-bar-height) - 32px);
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
  @media (width < 1024px) {
    section {
      --bottom-bar-height: 55px;
    }
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
