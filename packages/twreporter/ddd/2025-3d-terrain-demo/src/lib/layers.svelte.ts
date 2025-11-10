import * as Cesium from 'cesium'
import { parseCamera, queryContent } from './content'
import { source } from '../constants/imagery'

export function createCustomLayers(viewer?: Cesium.Viewer) {
  const contentQuery = queryContent()

  let content = $derived(contentQuery.data)
  let tiles = $derived(content?.tiles)
  let start = $derived(content?.start)
  let vectors = $derived(content?.vectors)

  $effect(() => {
    if (!viewer) return

    if (tiles) {
      tiles.forEach((tile) => {
        const pattern = /^([^.;]+)(?:\.([^;]+))?(?:;(.+))?$/
        const match = tile.match(pattern)
        console.log(match)
        if (!match) return
        const tileName = match[1]
        const tileExt = match[2] ?? 'png'
        const tileMax = Number(match[3]) ?? 19

        viewer?.imageryLayers.addImageryProvider(
          new Cesium.UrlTemplateImageryProvider({
            url: `${source.selfhostedBaseUrl}/${tileName}/{z}/{x}/{y}.${tileExt}`,
            maximumLevel: tileMax,
          })
        )
      })
    }

    if (start) {
      const { position, orientation } = parseCamera(start)
      viewer.camera.setView({
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
      })
    }

    if (vectors) {
      Cesium.GeoJsonDataSource.clampToGround = true
      vectors.forEach((vector) => {
        viewer?.dataSources.add(
          Cesium.GeoJsonDataSource.load(vector, {
            fill: Cesium.Color.TRANSPARENT,
            strokeWidth: 2,
            clampToGround: true,
          })
        )
      })
    }
  })
}
