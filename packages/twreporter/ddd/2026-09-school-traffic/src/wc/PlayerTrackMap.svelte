<script lang="ts">
  import Frame from '@lab-reporter/ddd-shared/components/shared/Frame.svelte'
  import Logo from '@lab-reporter/ddd-shared/components/shared/Logo.svelte'
  import Shell from '@lab-reporter/ddd-shared/components/shared/Shell.svelte'
  import { createGraphic } from '@lab-reporter/ddd-shared/utils/graphic-data.svelte.ts'
  import { ScrollerBase } from '@reuters-graphics/graphics-components'
  import { createQuery } from '@tanstack/svelte-query'
  import mapImage from '../assets/map.jpg'
  import mapAfterImage from '../assets/map-after.jpg'
  import defaultConfig from '../../public/player-track-map.json'
  import { playerTrackMapConfigSchema } from '../lib/components/player-track-map/types.ts'
  import { PlayerTrackMapScroller } from '../lib/components/player-track-map/scroller.svelte.ts'
  import Marker from '../lib/components/player-track-map/Marker.svelte'
  import InfoBox from '../lib/components/player-track-map/InfoBox.svelte'
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
    config = '',
  }: {
    getTrack?: GetTrack
    getInfoBoxes?: GetInfoBoxes
    config?: string
  } = $props()
  const id = $props.id()
  const edit = new URLSearchParams(window.location.search).has('edit')
  const graphic = createGraphic(
    'twreporter-player-track',
    playerTrackMapConfigSchema,
    () => ({ src: '', config }),
  )
  const fallbackConfig = playerTrackMapConfigSchema.parse(defaultConfig)
  const cards = $derived((graphic.config ?? fallbackConfig).cards)
  const scroller = new PlayerTrackMapScroller(() => cards)
  let visible = $state(false)
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
</script>

{#if graphic.error || graphic.loading}
  <Shell error={graphic.error} loading={graphic.loading} />
{:else}
  <div
    class="scrolly"
    style:--map-width={mapWidth}
    style:--map-height={mapHeight}
    style:--progress={Math.max(0, Math.min(1, scroller.progress))}
  >
    <ScrollerBase
      bind:progress={scroller.progress}
      bind:visible
      query=".scroll-space"
    >
      {#snippet backgroundSnippet()}
        <section>
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
                  <image
                    class="map-after"
                    class:visible={scroller.view === 'after'}
                    href={mapAfterImage}
                    width={mapWidth}
                    height={mapHeight}
                  />
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
                  <Marker
                    {info}
                    {pixel}
                    {edit}
                    selected={selectedId === info.id}
                    highlighted={scroller.highlightedMarkerIds.includes(
                      info.zoneId,
                    )}
                    infoBoxId={`${id}-info-box`}
                    onselect={() => (selectedId = info.id)}
                  />
                {/each}
              </div>
              {#each cards as card}
                <div
                  class="card scroll-card"
                  style:--card-position={card.position}
                >
                  {#if card.title}
                    <h2>{card.title}</h2>
                  {/if}
                  {#if card.text}
                    <p>{card.text}</p>
                  {/if}
                </div>
              {/each}
            </div>
          </div>
          {#if selected}
            <InfoBox
              id={`${id}-info-box`}
              info={selected}
              onclose={() => (selectedId = undefined)}
            />
          {/if}
        </section>
      {/snippet}
      {#snippet foregroundSnippet()}
        <div class="frame-track">
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
                  <div
                    class="card view-tabs"
                    role="group"
                    aria-label="道路改善前後"
                  >
                    <button
                      type="button"
                      aria-pressed={scroller.view === 'before'}
                      onclick={() => (scroller.view = 'before')}>現況</button
                    >
                    <button
                      type="button"
                      aria-pressed={scroller.view === 'after'}
                      onclick={() => (scroller.view = 'after')}>改善建議</button
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
        </div>
        <div
          class="scroll-space"
          style:height={`${(cards.length + 1) * 100}svh`}
          aria-hidden="true"
        ></div>
      {/snippet}
    </ScrollerBase>
  </div>
{/if}

<style>
  .scrolly {
    color: #333;
    font-family: 'Roboto Slab', 'Noto Sans TC', sans-serif;
  }

  .scrolly :global(svelte-scroller-background-container) {
    pointer-events: auto;
    will-change: auto;
  }

  .scrolly :global(svelte-scroller-foreground) {
    pointer-events: none;
  }

  section {
    anchor-scope: --selected-marker;
    isolation: isolate;
    box-sizing: border-box;
    position: relative;
    width: 100%;
    height: 100dvh;
  }

  .map {
    z-index: 0;
    overflow: clip;
    container-type: size;
    width: 100%;
    height: 100%;
    position: relative;
    touch-action: pan-y;
  }

  .scroll-card {
    position: absolute;
    top: 50%;
    left: calc(50cqw + (100% - 100cqw) * var(--card-position));
    transform: translate(-50%, -50%);
    box-sizing: border-box;
    width: min(360px, calc(100cqw - 48px));
    pointer-events: auto;
    display: flex;
    flex-direction: column;
    gap: 10px;
  }

  .map-after {
    opacity: 0;
    transition: opacity 400ms ease;
  }

  .map-after.visible {
    opacity: 1;
  }

  .scroll-card h2 {
    margin: 0;
    font-size: var(--text-m);
  }

  .scroll-card p {
    white-space: pre-line;
    font-size: var(--text-s);
  }

  .frame-track {
    position: absolute;
    inset: 0;
    z-index: 10;
    pointer-events: none;
  }

  .graph-frame {
    position: sticky;
    top: 0;
    width: 100%;
    height: 100dvh;
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
      font-size: 14px;
      font-weight: 400;
    }
  }

  .graph-control-container {
    flex: 1;
    min-height: 0;
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
    position: relative;
    width: max-content;
    height: 100%;
    transform: translateX(calc((100cqw - 100%) * var(--progress)));
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
  @media (prefers-reduced-motion: reduce) {
    .map-after {
      transition: none;
    }
  }

  @media (max-width: 767px) {
    .graph-frame {
      position: relative;
      height: 100%;
    }

    .scroll-card {
      top: calc(50cqh + (100% - 100cqh) * var(--card-position));
      left: 50%;
    }

    .map-frame {
      width: 100%;
      height: auto;
      aspect-ratio: var(--map-height) / var(--map-width);
      overflow: clip;
      transform: translateY(calc((100cqh - 100%) * var(--progress)));
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
  }
</style>
