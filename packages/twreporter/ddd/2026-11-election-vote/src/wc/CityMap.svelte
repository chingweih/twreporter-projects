<script lang="ts">
  import counties from '@lab-reporter/ddd-atlas/taiwan/counties' with { type: 'json' }
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
  import { electionTabs } from '../lib/election-data.ts'
  import ElectionGraphic from '../lib/ElectionGraphic.svelte'
  import { partyColorVars, resolvePartyColor } from '../lib/party-colors.ts'

  const offshore = countiesByGroup.get('離島') ?? []
  const offshoreCodes = new Set(
    offshore.map((county) => county.properties.code),
  )
  const taiwan = {
    type: 'FeatureCollection',
    features: counties.features.filter(
      (county) => !offshoreCodes.has(county.properties.code),
    ),
  } satisfies typeof counties
  const bounds = geoPath().bounds(taiwan)
  const insets = offshore.map((county) => ({
    code: county.properties.code,
    geometry: {
      type: 'FeatureCollection' as const,
      features: [county],
    },
  }))
  const preserveDrawingBuffer = new URLSearchParams(window.location.search).has(
    'download',
  )

  const {
    config,
    tiles,
  }: Pick<ComponentProps, 'config'> & {
    tiles?: { url: string; attribution: string }
  } = $props()
  const overview = createQuery(() => ({
    ...electionTabs.mayorOverview.options,
    select: indexMayorResults,
  }))
  const displayedParties = $derived(
    [...(overview.data ?? [])]
      .filter(([, result]) => result.領先者.trim())
      .map(([code, result]) => ({
        code,
        ...resolvePartyColor(result.領先者政黨.trim()),
      })),
  )
  const partyTokens = $derived(
    new Map(displayedParties.map(({ code, colorVar }) => [code, colorVar])),
  )
  const legend = $derived(
    Object.entries(partyColorVars).filter(([party]) =>
      displayedParties.some(({ label }) => label === party),
    ),
  )
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
  const tilePaint = $derived.by<FillLayerSpecification['paint']>(() => {
    if (!tileStyle || !mapFrame) return
    const theme = getComputedStyle(mapFrame)
    const neutralFill =
      theme.getPropertyValue('--elec-grayscale-1').trim() || theme.color
    // The MapLibre style parser needs a resolved color for the canvas.
    const colors = Object.fromEntries(
      [...partyTokens].map(([code, token]) => [
        code,
        theme.getPropertyValue(token).trim() || neutralFill,
      ]),
    )
    return {
      'fill-color': [
        'coalesce',
        ['get', ['get', 'code'], ['literal', colors]],
        neutralFill,
      ],
      'fill-outline-color':
        theme.getPropertyValue('--neutral-white').trim() || theme.color,
      'fill-opacity': 0.76,
    }
  })
</script>

{#snippet results(side: 'west' | 'east')}
  {#each countiesByGroup as [region, counties] (region)}
    {#if (region === '東' || region === '離島') === (side === 'east')}
      <ul class="results" aria-label={region}>
        {#each counties as { properties: { code, name } } (code)}
          {@const result = overview.data?.get(code)}
          {@const candidate = result?.領先者.trim()}
          <li>
            <strong>{name}</strong>
            <span
              class="swatch"
              style:background-color="var({partyTokens.get(code) ??
                '--elec-grayscale-1'})"
              role="img"
              aria-label={candidate
                ? result?.領先者政黨.trim() || '未提供政黨'
                : '尚無結果'}
            ></span>
            <span class="candidate">{candidate || '—'}</span>
            {#if result && candidate}
              <span class="share"
                >({formatNumber(result['領先得票率(%)'])}%)</span
              >
            {/if}
          </li>
        {/each}
      </ul>
    {/if}
  {/each}
{/snippet}

{#snippet taiwanShapes()}
  <CountyShapes geometry={taiwan} {partyTokens} width={360} height={620} />
{/snippet}

<ElectionGraphic
  batch={firstBatch}
  {config}
  graphicKey="1-city-map"
  wide
  error={overview.error?.message}
  loading={overview.isPending}
  empty={!overview.data?.size}
>
  <div class="composition">
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
      <ul class="legend" aria-label="圖例">
        {#each legend as [party, token] (party)}
          <li>
            <span
              class="swatch"
              style:background-color="var({token})"
              aria-hidden="true"
            ></span>{party}
          </li>
        {/each}
      </ul>
    {/if}
    <div class="west">{@render results('west')}</div>
    <div class="east">{@render results('east')}</div>
    <div class="insets" aria-hidden="true">
      {#each insets as { code, geometry } (code)}
        <div class="inset" class:penghu={code === '10016'}>
          <CountyShapes
            {geometry}
            {partyTokens}
            width={120}
            height={code === '10016' ? 176 : 84}
          />
        </div>
      {/each}
    </div>
  </div>
  {#if tiles}
    <p class="attribution">{tiles.attribution}</p>
  {/if}
</ElectionGraphic>

<style>
  .composition {
    display: grid;
    grid-template-columns: minmax(0, 1fr) minmax(0, 1.55fr) minmax(0, 1fr);
    grid-template-rows: auto auto 1fr;
    grid-template-areas: 'west map legend' 'west map east' 'west map insets';
    column-gap: 12px;
    row-gap: 16px;
    align-items: start;
    font-size: var(--text-xs);
  }
  .main-map {
    grid-area: map;
    position: relative;
    width: 100%;
    aspect-ratio: 360 / 620;
  }
  .map-content {
    position: absolute;
    inset: 0;
  }
  .west {
    grid-area: west;
  }
  .east {
    grid-area: east;
  }
  .legend {
    grid-area: legend;
  }
  .insets {
    grid-area: insets;
    align-self: end;
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 8px;
  }
  .inset {
    min-width: 0;
    aspect-ratio: 120 / 84;
    border: 1px solid var(--neutral-gray-300);
  }
  .inset.penghu {
    grid-row: span 2;
    aspect-ratio: auto;
  }
  .legend,
  .results {
    display: grid;
    gap: 5px;
    list-style: none;
    padding: 0;
    margin: 0;
  }
  .results + .results {
    margin-top: 18px;
  }
  .legend li,
  .results li {
    display: flex;
    align-items: center;
    gap: 5px;
  }
  .results li {
    background: var(--neutral-gray-200);
    padding: 3px 5px;
    flex-wrap: wrap;
  }
  .results strong,
  .candidate,
  .share {
    white-space: nowrap;
  }
  .share,
  .attribution {
    color: var(--neutral-gray-700);
  }
  .swatch {
    width: 0.9em;
    height: 0.9em;
    flex: none;
    border-radius: 3px;
  }
  .attribution {
    margin: 0;
    font-size: var(--text-xs);
  }
  @container (max-width: 670px) {
    .composition {
      grid-template-columns: minmax(0, 1fr) minmax(0, 1fr);
      grid-template-rows: auto;
      grid-template-areas: 'legend legend' 'map map' 'insets insets' 'west east';
      gap: 12px;
    }
    .main-map {
      width: min(100%, 280px);
      margin-inline: auto;
    }
    .legend {
      display: flex;
      flex-wrap: wrap;
      gap: 6px 12px;
    }
    .insets {
      grid-template-columns: repeat(3, minmax(0, 1fr));
    }
    .inset.penghu {
      grid-row: auto;
      aspect-ratio: 120 / 84;
    }
  }
  @container (max-width: 360px) {
    .composition {
      grid-template-columns: minmax(0, 1fr);
      grid-template-areas: 'legend' 'map' 'insets' 'west' 'east';
    }
  }
</style>
