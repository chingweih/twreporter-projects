<script lang="ts">
  import Legend from '@lab-reporter/ddd-shared/components/shared/Legend.svelte'
  import counties from '@lab-reporter/ddd-atlas/taiwan/counties' with { type: 'json' }
  import { splitTaiwanCounties } from '@lab-reporter/ddd-atlas/taiwan/map'
  import MapCanvas from '@lab-reporter/ddd-shared/components/shared/MapCanvas.svelte'
  import type { ComponentProps } from '@lab-reporter/ddd-shared/components/types.ts'
  import { formatNumber } from '@lab-reporter/ddd-shared/utils/format.ts'
  import { createQuery } from '@tanstack/svelte-query'
  import { geoPath } from 'd3-geo'
  import type { FillLayerSpecification, StyleSpecification } from 'maplibre-gl'
  import { FillLayer, GeoJSONSource } from 'svelte-maplibre-gl'
  import { firstBatch } from '../lib/batches/first.ts'
  import CountyShapes from '../lib/components/city-map/CountyShapes.svelte'
  import {
    countiesByGroup,
    indexMayorResults,
  } from '../lib/components/city-map/data.ts'
  import { historicalElectionTabs } from '../lib/election-historical-data.ts'
  import ElectionGraphic from '../lib/ElectionGraphic.svelte'
  import { partyColorVars, resolvePartyColor } from '../lib/party-colors.ts'

  const { mainIsland: taiwan, insets } = splitTaiwanCounties(counties)
  const insetOrder = ['09007', '09020', '10016']
  const municipalities = ['63000', '65000', '68000', '66000', '67000', '64000']
  const resultCounties = [...countiesByGroup.values()].flat().sort((a, b) => {
    const rank = (code: string) => {
      const index = municipalities.indexOf(code)
      return index === -1 ? municipalities.length : index
    }
    return rank(a.properties.countyCode) - rank(b.properties.countyCode)
  })
  const orderedInsets = [...insets].sort(
    (a, b) =>
      insetOrder.indexOf(a.countyCode) - insetOrder.indexOf(b.countyCode),
  )
  const bounds = geoPath().bounds(taiwan)
  const preserveDrawingBuffer = new URLSearchParams(window.location.search).has(
    'download',
  )

  const {
    config,
    ratio,
    tiles,
  }: Pick<ComponentProps, 'config' | 'ratio'> & {
    tiles?: { url: string; attribution: string }
  } = $props()
  const overview = createQuery(() => ({
    ...historicalElectionTabs.mayorWinners.options,
    select: indexMayorResults,
  }))
  const displayedParties = $derived(
    [...(overview.data ?? [])]
      .filter(([, result]) => result.當選人.trim())
      .map(([countyCode, result]) => ({
        countyCode,
        ...resolvePartyColor(result.政黨.trim()),
      })),
  )
  const partyTokens = $derived(
    new Map(
      displayedParties.map(({ countyCode, colorVar }) => [
        countyCode,
        colorVar,
      ]),
    ),
  )
  const legend = $derived([
    ...Object.entries(partyColorVars).filter(([party]) =>
      displayedParties.some(({ label }) => label === party),
    ),
    ...(resultCounties.some(
      ({ properties }) => !partyTokens.has(properties.countyCode),
    )
      ? [['尚無資料', '--neutral-gray-200']]
      : []),
  ])
  const tileStyle = $derived<StyleSpecification | undefined>(
    tiles && {
      version: 8,
      sources: {
        basemap: { type: 'raster', tiles: [tiles.url], tileSize: 256 },
      },
      layers: [{ id: 'basemap', type: 'raster', source: 'basemap' }],
    },
  )

  let mapFrame = $state<HTMLDivElement>()
  let containerWidth = $state(0)
  const mobile = $derived(containerWidth > 0 && containerWidth <= 580)
  const tilePaint = $derived.by<FillLayerSpecification['paint']>(() => {
    if (!tileStyle || !mapFrame) return
    const theme = getComputedStyle(mapFrame)
    const neutralFill =
      theme.getPropertyValue('--neutral-gray-200').trim() || theme.color
    // The MapLibre style parser needs a resolved color for the canvas.
    const colors = Object.fromEntries(
      [...partyTokens].map(([countyCode, token]) => [
        countyCode,
        theme.getPropertyValue(token).trim() || neutralFill,
      ]),
    )
    return {
      'fill-color': [
        'coalesce',
        ['get', ['get', 'countyCode'], ['literal', colors]],
        neutralFill,
      ],
      'fill-outline-color':
        theme.getPropertyValue('--neutral-white').trim() || theme.color,
      'fill-opacity': 0.76,
    }
  })
</script>

{#snippet results()}
  <ul class="results" aria-label="各縣市領先候選人">
    {#each resultCounties as { properties: { countyCode, name } } (countyCode)}
      {@const result = overview.data?.get(countyCode)}
      <li>
        <strong>{name}</strong>
        {#each [{ name: result?.當選人.trim(), party: result?.政黨.trim(), share: result?.['得票率（%）'] }] as candidate, index}
          <!-- 暫停顯示第二名：{ name: result?.第二名.trim(), party: result?.第二名政黨.trim(), share: result?.['第二名得票率(%)'] } -->
          <div class="candidate-result" class:runner-up={index === 1}>
            <div class="candidate-identity">
              <span
                class="swatch"
                style:background-color="var({candidate.name
                  ? resolvePartyColor(candidate.party ?? '').colorVar
                  : '--neutral-gray-200'})"
                aria-hidden="true"
              ></span>
              <span class="candidate-name" title={candidate.name}
                >{candidate.name || '—'}</span
              >
            </div>
            <span class="declared"
              >{index === 0 && result?.自行宣布當選.trim() === '*'
                ? '*'
                : ''}</span
            >
            {#if candidate.name && candidate.share != null}<span class="share"
                >({formatNumber(candidate.share)}%)</span
              >{/if}
          </div>
        {/each}
      </li>
      {#if countyCode === municipalities.at(-1)}
        <li class="separator" aria-hidden="true"><span></span></li>
      {/if}
    {/each}
  </ul>
{/snippet}

{#snippet taiwanShapes()}
  <CountyShapes
    geometry={taiwan}
    {partyTokens}
    width={360}
    height={620}
    preserveAspectRatio="xMaxYMid meet"
  />
{/snippet}

<div class="city-map-wrapper" bind:clientWidth={containerWidth}>
  <ElectionGraphic
    batch={firstBatch}
    {config}
    {ratio}
    graphicKey="1-city-map"
    autoHeight={mobile}
    // wide
    error={overview.error?.message}
    loading={overview.isPending}
  >
    {#snippet children(entry)}
      <div
        class="composition"
        class:sized={entry.ratio !== undefined ||
          (!mobile && !!(entry.containerHeight || entry.containerAspectRatio))}
      >
        <div class="main-map" bind:this={mapFrame} aria-hidden="true">
          <div class="map-content">
            {#if tileStyle && tilePaint}
              <svelte:boundary>
                <MapCanvas
                  {bounds}
                  style={tileStyle}
                  height="100%"
                  canvasContextAttributes={{ preserveDrawingBuffer }}
                >
                  <GeoJSONSource id="city-counties" data={taiwan} maxzoom={8}>
                    <FillLayer id="city-counties-fill" paint={tilePaint} />
                  </GeoJSONSource>
                </MapCanvas>
                {#snippet failed()}
                  {@render taiwanShapes()}
                {/snippet}
              </svelte:boundary>
            {:else}
              {@render taiwanShapes()}
            {/if}
          </div>
        </div>
        {#if legend.length}
          <div class="legend-container">
            <Legend
              items={legend.map(([label, token]) => ({
                label,
                color: `var(${token})`,
              }))}
            />
          </div>
        {/if}
        <div class="county-results">{@render results()}</div>
        <div class="insets" aria-hidden="true">
          {#each orderedInsets as { countyCode, geometry } (countyCode)}
            <div class="inset" class:penghu={countyCode === '10016'}>
              <CountyShapes
                {geometry}
                {partyTokens}
                width={120}
                height={countyCode === '10016' ? 176 : 84}
                showStroke={false}
              />
            </div>
          {/each}
        </div>
      </div>
      {#if tiles}
        <p class="attribution">{tiles.attribution}</p>
      {/if}
    {/snippet}
  </ElectionGraphic>
</div>

<style>
  .composition {
    display: grid;
    grid-template-columns: minmax(0, 1fr) max-content;
    grid-template-rows: auto 1fr;
    grid-template-areas: 'legend legend' 'map results';
    gap: 12px 0;
    align-items: start;
    font-size: var(--text-s);
  }
  .main-map {
    grid-area: map;
    position: relative;
    width: 100%;
    height: 100%;
    min-height: 600px;
  }
  .sized .main-map {
    min-height: 0;
  }
  .sized .county-results,
  .sized .results {
    /* height: 100%; */
    min-height: 0;
  }
  .sized .results {
    grid-template-rows: repeat(6, minmax(0, 1fr)) auto repeat(
        16,
        minmax(0, 1fr)
      );
  }
  .map-content {
    position: absolute;
    inset: 0;
    transform: translateX(-10px);
  }
  .county-results {
    grid-area: results;
    justify-self: end;
  }
  .legend-container {
    grid-area: legend;
  }
  .legend-container :global(.legend) {
    margin: 0;
  }
  .insets {
    grid-area: map;
    z-index: 1;
    width: 20%;
    max-width: 96px;
    pointer-events: none;
    align-self: stretch;
    display: flex;
    flex-direction: column;
    gap: 12px;
  }
  .inset {
    width: 100%;
    aspect-ratio: 120 / 100;
    border: 1px solid var(--neutral-gray-300);
  }
  .inset.penghu {
    margin-top: auto;
    aspect-ratio: 120 / 176;
  }
  .results {
    list-style: none;
    padding: 0;
    margin: 0;
  }
  .results {
    display: grid;
    gap: 4px;
  }
  .results li {
    display: grid;
    grid-template-columns: 3em max-content;
    gap: 10px;
    align-items: center;
  }
  .results strong {
    font-weight: 500;
    white-space: nowrap;
  }
  .results li.separator {
    display: block;
    padding-block: 8px;
  }
  .separator span {
    display: block;
    border-bottom: 1px solid var(--neutral-gray-300);
  }
  .candidate-result {
    display: grid;
    grid-template-columns: max-content 0.5em max-content;
    align-items: center;
    gap: 4px;
    white-space: nowrap;
  }
  .runner-up {
    opacity: 0.25;
  }
  .candidate-result {
    min-width: 0;
  }
  .candidate-identity {
    display: flex;
    align-items: center;
    gap: 3px;
    flex-shrink: 0;
  }
  .candidate-name {
    flex: 0 0 calc(3em + 1px);
    max-width: calc(3em + 1px);
    letter-spacing: 0;
    min-width: 0;
    font-weight: 400;
  }
  .declared {
    text-align: center;
  }
  .share {
    flex-shrink: 0;
    font-variant-numeric: tabular-nums;
  }
  .share,
  .attribution {
    color: var(--neutral-gray-400);
    font-weight: 300;
  }
  .swatch {
    width: 0.9em;
    height: 0.9em;
    flex: none;
    border-radius: 2px;
  }
  .attribution {
    margin: 0;
    font-size: var(--text-xs);
  }
  @container (max-width: 580px) {
    .composition {
      grid-template-columns: minmax(0, 1fr);
      grid-template-rows: auto auto auto;
      grid-template-areas: 'legend' 'results' 'map';
      gap: 12px 6px;
    }
    .main-map,
    .sized .main-map {
      min-height: 0;
      height: auto;
      aspect-ratio: 360 / 620;
    }
    .results li {
      grid-template-columns: 3em max-content;
      gap: 4px;
      font-size: 14px;
    }
    .results {
      grid-template-columns: repeat(2, minmax(0, 1fr));
      gap: 4px 12px;
    }
    .sized .results {
      height: auto;
      grid-template-rows: none;
      gap: 4px 12px;
    }
    .share {
      font-size: 11px;
    }
    .results li.separator {
      grid-column: 1 / -1;
    }
    .county-results {
      justify-self: stretch;
    }
    .sized .county-results {
      height: auto;
    }
    .runner-up {
      display: none;
    }
  }
</style>
