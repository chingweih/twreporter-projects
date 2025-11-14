<script lang="ts">
  import * as Cesium from 'cesium'
  import 'cesium/Build/Cesium/Widgets/widgets.css'
  import CardContent from './components/CardContent.svelte'
  import Loading from './components/Loading.svelte'
  import { getCard, parseCamera } from './lib/content'
  import { cesiumContainerId, useCesium } from './lib/runes/cesium.svelte'

  const cesium = useCesium({ containerId: cesiumContainerId })
  let viewer = $derived(cesium.viewer)
  let contentQuery = $derived(cesium.query)

  let content = $derived(contentQuery?.data)
  let cards = $derived(contentQuery?.data?.cards)

  let activeCardName = $state<string | null>(null)
  let activeCard = $derived(
    content && getCard({ content, name: activeCardName })
  )

  function handleScroll() {
    if (!viewer || !cards) return

    const viewportHeight = window.innerHeight

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
      duration: 2.5,
      maximumHeight: 100,
      easingFunction: Cesium.EasingFunction.QUADRATIC_IN_OUT,
    })
  })
</script>

<svelte:document onscroll={handleScroll} />

<div class="base">
  <div class="background">
    {#if contentQuery.isLoading}
      <div class="loading-screen"><Loading /></div>
    {/if}
    <div id={cesiumContainerId} class="map"></div>
  </div>
  <div class="scroll" style:position="relative">
    {#each cards as card}
      <CardContent {card} />
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
