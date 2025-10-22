<script lang="ts">
  import * as Cesium from 'cesium'
  import 'cesium/Build/Cesium/Widgets/widgets.css'
  import { onMount } from 'svelte'
  import { getTimeline, getTimelineById, timeline } from './lib/timeline'

  let editMode = $state()

  let viewer: Cesium.Viewer | undefined = $state()
  const containerId = 'cesiumContainer'
  const terrainServer =
    'https://storage.googleapis.com/data-reporter-infographics/dev/2025-3d-terrain-demo/terrain'

  // Taiwan bounding box
  // 25.45679248899884, 120.14837985134528
  // 21.897146905114784, 121.79268072509971

  const defaultRectangle = Cesium.Rectangle.fromDegrees(
    120.14837985134528,
    21.897146905114784,
    121.79268072509971,
    25.45679248899884
  )

  Cesium.Camera.DEFAULT_VIEW_RECTANGLE = defaultRectangle
  Cesium.Camera.DEFAULT_VIEW_FACTOR = 0

  onMount(async () => {
    const searchParams = new URLSearchParams(window.location.search)
    editMode = searchParams.get('edit') === ''

    viewer = new Cesium.Viewer(containerId, {
      terrainProvider:
        await Cesium.CesiumTerrainProvider.fromUrl(terrainServer),
      baseLayer: new Cesium.ImageryLayer(
        new Cesium.UrlTemplateImageryProvider({
          url: 'https://wmts.nlsc.gov.tw/wmts/PHOTO2/default/GoogleMapsCompatible/{z}/{y}/{x}',
          maximumLevel: 19,
        })
      ),
      sceneMode: Cesium.SceneMode.COLUMBUS_VIEW,
      timeline: false,
      animation: false,
      fullscreenButton: false,
      vrButton: false,
      sceneModePicker: false,
      navigationHelpButton: false,
      homeButton: false,
      geocoder: false,
      infoBox: false,
      creditContainer: document.createElement('div'),
      baseLayerPicker: false,
    })

    if (!!!editMode) {
      // Disable user interactions
      viewer.scene.screenSpaceCameraController.enableRotate = false
      viewer.scene.screenSpaceCameraController.enableTranslate = false
      viewer.scene.screenSpaceCameraController.enableZoom = false
      viewer.scene.screenSpaceCameraController.enableTilt = false
      viewer.scene.screenSpaceCameraController.enableLook = false
    }
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

{#if editMode}
  <div id={containerId} class="map"></div>
{/if}

{#if !!!editMode}
  <div class="base">
    <div class="background">
      <div id={containerId} class="map"></div>
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
{/if}

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
