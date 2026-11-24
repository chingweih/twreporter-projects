<script lang="ts">
  import type counties from '@lab-reporter/ddd-atlas/taiwan/counties'
  import { geoIdentity, geoPath } from 'd3-geo'

  const {
    geometry,
    partyTokens,
    width,
    height,
  }: {
    geometry: typeof counties
    partyTokens: ReadonlyMap<string, string>
    width: number
    height: number
  } = $props()

  const paths = $derived.by(() => {
    const projection = geoIdentity()
      .reflectY(true)
      .fitExtent(
        [
          [4, 4],
          [width - 4, height - 4],
        ],
        geometry,
      )
    const path = geoPath(projection).digits(2)
    return geometry.features.map((county) => ({
      countyCode: county.properties.countyCode,
      path: path(county) ?? '',
    }))
  })
</script>

<svg viewBox="0 0 {width} {height}" aria-hidden="true">
  {#each paths as county (county.countyCode)}
    <path
      d={county.path}
      fill="var({partyTokens.get(county.countyCode) ?? '--elec-grayscale-1'})"
      stroke="var(--neutral-white)"
      stroke-width="1"
      vector-effect="non-scaling-stroke"
    />
  {/each}
</svg>

<style>
  svg {
    display: block;
    width: 100%;
    height: 100%;
  }
</style>
