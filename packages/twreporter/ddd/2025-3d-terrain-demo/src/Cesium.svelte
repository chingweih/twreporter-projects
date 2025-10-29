<script lang="ts">
  import * as Cesium from 'cesium'
  import 'cesium/Build/Cesium/Widgets/widgets.css'
  import { onMount } from 'svelte'
  import { cesiumConfig } from './lib/cesium'
  import { getCard, getContent, parseCamera } from './lib/content'
  import { createQuery } from '@tanstack/svelte-query'
  import Loading from './components/Loading.svelte'
  import CardContent from './components/CardContent.svelte'
  import { source } from './constants/imagery'

  let viewer: Cesium.Viewer | undefined = $state()

  export const contentQuery = createQuery(() => ({
    queryKey: ['content'],
    queryFn: getContent,
  }))

  let content = $derived(contentQuery.data)
  let tiles = $derived(content?.tiles)

  onMount(() => {
    viewer = new Cesium.Viewer(cesiumConfig.id, cesiumConfig.viewerConfig)

    // Disable user interactions
    viewer.scene.screenSpaceCameraController.enableRotate = false
    viewer.scene.screenSpaceCameraController.enableTranslate = false
    viewer.scene.screenSpaceCameraController.enableZoom = false
    viewer.scene.screenSpaceCameraController.enableTilt = false
    viewer.scene.screenSpaceCameraController.enableLook = false
  })

  let activeCardName = $state<string | null>(null)
  let activeCard = $derived(
    content && getCard({ content, name: activeCardName })
  )

  function handleScroll() {
    if (!viewer || !content) return

    const scrolledY = window.scrollY
    const viewportHeight = window.innerHeight
    const cards = content.cards

    for (let i = 0; i < cards.length; i++) {
      const card = cards[i]
      const cardElement = document.getElementById(card.name)

      if (!cardElement) continue

      const cardTop = cardElement.getBoundingClientRect().top
      const cardBottom = cardTop + cardElement.offsetHeight

      const triggerPoint = viewportHeight / 3

      if (cardTop <= triggerPoint && cardBottom >= triggerPoint) {
        activeCardName = card.name
        break
      }
    }
  }

  $effect(() => {
    console.log(activeCardName)

    if (!activeCard) {
      return
    }

    const { position, orientation } = parseCamera(activeCard.camera)
    console.log(position, orientation)

    viewer?.camera.flyTo({
      destination: Cesium.Cartesian3.fromArray([
        position.x,
        position.y,
        position.z,
      ]),
      orientation: {
        heading: orientation.heading,
        pitch: orientation.pitch,
        roll: orientation.roll,
      },
      duration: 1.5,
    })
  })

  $effect(() => {
    if (!viewer || !tiles) return

    tiles.forEach((tile) => {
      viewer?.imageryLayers.addImageryProvider(
        new Cesium.UrlTemplateImageryProvider({
          url: `${source.selfhostedBaseUrl}/${tile}/{z}/{x}/{y}.png`,
          maximumLevel: 19,
        })
      )
    })
  })
</script>

<svelte:document onscroll={handleScroll} />

<div class="base">
  <div class="background">
    {#if contentQuery.isLoading}
      <div class="loading-screen"><Loading /></div>
    {/if}
    <div id={cesiumConfig.id} class="map"></div>
  </div>
  <div class="scroll" style:position="relative">
    {#if content}
      {#each content.cards as card}
        <CardContent {card} />
      {/each}
    {/if}
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
    position: relative;
    z-index: 1;
  }

  .map {
    height: 100%;
  }

  .loading-screen {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background: rgba(0, 0, 0, 0.8);
    color: white;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 1.5rem;
    z-index: 10;
  }

  :global(.cesium-viewer) {
    height: 100%;
  }
</style>
