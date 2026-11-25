<script lang="ts">
  import type { TaiwanCountySplit } from '@lab-reporter/ddd-atlas/taiwan/map'
  import D3Map from '@lab-reporter/ddd-shared/components/shared/D3Map.svelte'

  const {
    geometry,
    partyTokens,
    width,
    height,
  }: {
    geometry: TaiwanCountySplit['mainIsland']
    partyTokens: ReadonlyMap<string, string>
    width: number
    height: number
  } = $props()
</script>

<D3Map {geometry} {width} {height} padding={4} style="height: 100%">
  {#snippet children(path)}
    {#each geometry.features as county (county.properties.countyCode)}
      <path
        d={path(county)}
        fill="var({partyTokens.get(county.properties.countyCode) ??
          '--elec-gray-1'})"
        stroke="var(--neutral-white)"
        stroke-width="1"
        vector-effect="non-scaling-stroke"
      />
    {/each}
  {/snippet}
</D3Map>
