import * as Cesium from 'cesium'
import { source } from '../constants/imagery'
import { terrainServer } from '../constants/terrain'

// Taiwan bounding box
// 25.45679248899884, 120.14837985134528
// 21.897146905114784, 121.79268072509971

export const rectangles = {
  taiwan: Cesium.Rectangle.fromDegrees(
    120.14837985134528,
    21.897146905114784,
    121.79268072509971,
    25.45679248899884
  ),
}

const containerId = 'cesium-container'

export const cesiumConfig: {
  id: string
  viewerConfig: Cesium.Viewer.ConstructorOptions
} = {
  id: containerId,
  viewerConfig: {
    terrainProvider: await Cesium.CesiumTerrainProvider.fromUrl(terrainServer),
    baseLayer: new Cesium.ImageryLayer(
      new Cesium.UrlTemplateImageryProvider({
        url: source.arcGIS,
        maximumLevel: 20,
      })
    ),
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
  },
}
