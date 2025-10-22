<script lang="ts">
  import * as Cesium from 'cesium'
  import 'cesium/Build/Cesium/Widgets/widgets.css'
  import { onMount } from 'svelte'
  import { getTimeline, getTimelineById, timeline } from './lib/timeline'
  import { cesiumConfig } from './lib/cesium'

  let viewer: Cesium.Viewer | undefined = $state()

  onMount(() => {
    viewer = new Cesium.Viewer(cesiumConfig.id, cesiumConfig.viewerConfig)

    // Disable user interactions
    viewer.scene.screenSpaceCameraController.enableRotate = false
    viewer.scene.screenSpaceCameraController.enableTranslate = false
    viewer.scene.screenSpaceCameraController.enableZoom = false
    viewer.scene.screenSpaceCameraController.enableTilt = false
    viewer.scene.screenSpaceCameraController.enableLook = false
  })

  let activeTimelineId = $state<string | null>(null)

  function handleScroll() {
    if (!viewer) return

    const scrolledY = window.scrollY

    activeTimelineId = getTimeline(scrolledY)?.id ?? null
  }

  $effect(() => {
    console.log(activeTimelineId)

    const activeTimeline = getTimelineById(activeTimelineId)

    if (!activeTimeline) {
      return
    }

    viewer?.camera.flyTo({
      destination: new Cesium.Cartesian3(...activeTimeline?.position),
      orientation: {
        heading: activeTimeline.heading,
        pitch: activeTimeline.pitch,
        roll: activeTimeline.roll,
      },
      duration: 2,
    })
  })
</script>

<svelte:document onscroll={handleScroll} />

<div class="base">
  <div class="background">
    <div id={cesiumConfig.id} class="map"></div>
  </div>
  <div class="scroll" style:position="relative">
    {#each timeline as card}
      <div
        style:position="absolute"
        style:top={`calc(${card.y}px + 50vh)`}
        style="height: 100px; background: white; width: 50%;"
      >
        {card.id}
      </div>
    {/each}
  </div>
</div>

<p style:height="500px">內文內文內文</p>

<style>
  .base {
    position: relative;
  }
  .background {
    height: 100vh;
    position: sticky;
    top: 0;
    left: 0;
    width: 100%;
    z-index: -1;
  }

  .scroll {
    height: 5000px;
    position: relative;
    z-index: 1;
  }

  .map {
    height: 100%;
  }

  :global(.cesium-viewer) {
    height: 100%;
  }
</style>
