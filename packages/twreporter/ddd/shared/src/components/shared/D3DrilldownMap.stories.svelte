<script module lang="ts">
  import districts from '@lab-reporter/ddd-atlas/taiwan/counties/63000/districts' with { type: 'json' }
  import villages from '@lab-reporter/ddd-atlas/taiwan/counties/63000/villages' with { type: 'json' }
  import { defineMeta } from '@storybook/addon-svelte-csf'
  import { MapDrilldown } from '../../utils/map-drilldown.svelte.ts'
  import D3DrilldownMap from './D3DrilldownMap.svelte'

  const regions = districts.features.map(({ geometry, properties }) => ({
    key: properties.districtCode,
    label: properties.name,
    geometry,
    fill: '#cadeeb',
  }))
  const { Story } = defineMeta({
    title: 'Core/D3DrilldownMap',
    component: D3DrilldownMap,
    parameters: { layout: 'padded', controls: { include: ['padding'] } },
    args: { padding: 24 },
  })
</script>

<Story name="Taipei districts and villages">
  {#snippet template({ padding })}
    {@const drilldown = new MapDrilldown(
      (key) => regions.find((region) => region.key === key)?.geometry,
    )}
    {@const details = villages.features
      .filter(
        ({ properties }) =>
          !properties.unassigned &&
          properties.districtCode === drilldown.selectedKey,
      )
      .map(({ geometry, properties }) => ({
        key: properties.villageCode,
        label: properties.name ?? properties.villageCode,
        geometry,
        fill: '#b5cfe2',
      }))}
    {#if drilldown.focus}
      <button
        type="button"
        bind:this={drilldown.backButton}
        onclick={() => drilldown.back()}>Back to Taipei</button
      >
    {/if}
    <D3DrilldownMap
      geometry={districts}
      width={480}
      height={360}
      {padding}
      {regions}
      {details}
      {drilldown}
      label="Taipei district map"
    >
      {#snippet tooltip(key)}
        {details.find((area) => area.key === key)?.label ??
          regions.find((area) => area.key === key)?.label}
      {/snippet}
    </D3DrilldownMap>
  {/snippet}
</Story>
