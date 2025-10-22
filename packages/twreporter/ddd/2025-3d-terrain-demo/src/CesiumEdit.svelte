<script lang="ts">
  import * as Cesium from 'cesium'
  import { onMount } from 'svelte'
  import { cesiumConfig } from './lib/cesium'

  let viewer: Cesium.Viewer | undefined = $state()
  let position: string | undefined = $state()
  let perspective: string | undefined = $state()

  onMount(() => {
    viewer = new Cesium.Viewer(cesiumConfig.id, cesiumConfig.viewerConfig)
  })

  $effect(() => {
    if (!viewer) return

    const handleCameraMove = () => {
      if (!viewer) return

      position = viewer.camera.position.toString()
      perspective = `${viewer.camera.heading};${viewer.camera.pitch};${viewer.camera.roll}`
      console.log(position)
    }

    const removeListener =
      viewer.camera.moveEnd.addEventListener(handleCameraMove)

    return removeListener
  })
</script>

<div id={cesiumConfig.id} class="map"></div>
<div class="info">
  <h1>相機資訊（按著 Control 可拖動視角）</h1>
  <p>{position}</p>
  <p>{perspective}</p>
</div>

<style>
  .map {
    width: 100vw;
    height: 100vh;
  }

  .info {
    position: absolute;
    top: 10px;
    left: 10px;
    background: white;
    padding: 10px 20px;
    border-radius: 5px;
    font-size: 0.8rem;
  }

  .info h1 {
    font-weight: bold;
    margin: 0 0 10px 0;
  }
</style>
