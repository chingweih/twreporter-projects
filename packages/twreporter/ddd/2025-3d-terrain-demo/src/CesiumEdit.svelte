<script lang="ts">
  import { cesiumContainerId, useCesium } from './lib/runes/cesium.svelte'

  let { viewer } = useCesium({
    containerId: cesiumContainerId,
    options: {
      interaction: true,
    },
    onViewerMount: (viewer) => {
      const handleCameraMove = () => {
        if (!viewer) return

        position = viewer.camera.position.toString()
        perspective = `${viewer.camera.heading.toString()};${viewer.camera.pitch.toString()};${viewer.camera.roll.toString()}`
        console.log(position)
      }

      viewer.camera.changed.addEventListener(handleCameraMove)
    },
  })

  let position: string | undefined = $state()
  let perspective: string | undefined = $state()
  let cameraString = $derived(
    position && perspective ? `${position}|${perspective}` : ''
  )
  let copied: boolean = $state(false)
</script>

<div id={cesiumContainerId} class="map"></div>
<div class="info">
  <h1>
    編輯模式<span style:margin-left="5px">按住 Control 可拖動視角</span>
  </h1>
  <textarea disabled>{cameraString}</textarea>
  <div style="display:flex;gap:10px;align-items:center">
    <button
      onclick={() => {
        navigator.clipboard.writeText(cameraString).then(() => {
          copied = true
          setTimeout(() => {
            copied = false
          }, 3000)
        })
      }}>複製</button
    >
    {#if copied}
      <span>已複製成功</span>
    {/if}
  </div>
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
    background: rgba(0, 0, 0, 0.6);
    padding: 10px 20px;
    font-size: 0.8rem;
    color: white;
    display: flex;
    align-items: start;
    justify-content: center;
    flex-direction: column;
    gap: 15px;
  }

  .info * {
    color: white;
  }

  .info h1 {
    font-weight: bold;
    font-size: 1.2rem;
  }

  .info span {
    font-size: 0.65rem;
  }

  textarea {
    resize: none;
    padding: 5px 10px;
    background: transparent;
    border: 1px solid rgba(255, 255, 255, 0.1);
    border-radius: 2px;
    width: 250px;
    font-family: monospace;
    font-size: 0.5rem;
    height: 50px;
  }

  button {
    border: 1px solid rgba(255, 255, 255, 0.5);
    border-radius: 2px;
    padding: 4px 8px;
  }
</style>
