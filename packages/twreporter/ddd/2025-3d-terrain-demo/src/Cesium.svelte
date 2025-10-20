<script lang="ts">
  import { onMount } from 'svelte'
  import * as Cesium from 'cesium'
  import 'cesium/Build/Cesium/Widgets/widgets.css'

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
    viewer = new Cesium.Viewer(containerId, {
      terrainProvider:
        await Cesium.CesiumTerrainProvider.fromUrl(terrainServer),
      timeline: false,
      animation: false,
      fullscreenButton: false,
      vrButton: false,
      sceneModePicker: false,
      sceneMode: Cesium.SceneMode.COLUMBUS_VIEW,
      navigationHelpButton: false,
      homeButton: false,
      geocoder: false,
      infoBox: false,
      creditContainer: document.createElement('div'),
    })

    // 23.679494411877414, 121.28693223633375

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
  })
</script>

<div id={containerId} class="map"></div>

<style>
  .map {
    height: 100vh;
  }
</style>
