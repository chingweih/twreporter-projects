<script lang="ts">
  import Cesium from './Cesium.svelte'
</script>

<link
  rel="stylesheet"
  href="https://cdn.jsdelivr.net/npm/tailwindcss-preflight@1.0.1/preflight.min.css"
  crossorigin="anonymous"
/>
<link
  rel="preconnect"
  href="https://fonts.googleapis.com"
  crossorigin="anonymous"
/>
<link
  rel="preconnect"
  href="https://fonts.gstatic.com"
  crossorigin="anonymous"
/>
<link
  href="https://fonts.googleapis.com/css2?family=Noto+Sans+TC:wght@100..900&family=Roboto+Slab:wght@100..900&display=swap"
  rel="stylesheet"
  crossorigin="anonymous"
/>

<main>
  <Cesium />
</main>

<style>
  :global(*) {
    --tr-text: #404040;
    color: var(--tr-text);
    font-family: 'Roboto Slab', 'Noto Sans TC', sans-serif;
    text-align: left !important;
  }
</style>
