<script lang="ts">
  import { onMount } from 'svelte'
  import * as Cesium from 'cesium'
  import 'cesium/Build/Cesium/Widgets/widgets.css'

  let editMode = $state()

  let viewer: Cesium.Viewer | undefined = $state()
  const containerId = 'cesiumContainer'
  const terrainServer =
    'https://storage.googleapis.com/data-reporter-infographics/dev/2025-3d-terrain-demo/terrain?no-cache'

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

  function handleScroll() {
    const scrolledY = window.scrollY

    if (!viewer) return

    if (scrolledY > 1000) {
      viewer.camera.flyTo({
        destination: Cesium.Cartesian3.fromDegrees(
          121.28693223633375,
          23.679494411877414,
          8000
        ),
        orientation: {
          heading: Cesium.Math.toRadians(15.0),
          pitch: Cesium.Math.toRadians(-60.0),
          roll: 0.0,
        },
      })
    }
  }
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
    <div class="scroll"><div>Hello</div></div>
  </div>

  <p style:height="500px">Some Additional Content</p>
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
    height: 10000px;
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
