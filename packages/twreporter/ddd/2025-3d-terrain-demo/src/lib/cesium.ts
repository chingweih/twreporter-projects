import * as Cesium from 'cesium'
import { source } from '../constants/imagery'

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

const containerId = 'cesium-container'

const terrainServer =
  'https://storage.googleapis.com/data-reporter-infographics/dev/2025-3d-terrain-demo/terrain'

export const cesiumConfig = {
  id: containerId,
  viewerConfig: {
    terrainProvider: await Cesium.CesiumTerrainProvider.fromUrl(terrainServer),
    baseLayer: new Cesium.ImageryLayer(
      new Cesium.UrlTemplateImageryProvider({
        url: source.arcGIS,
        maximumLevel: 20,
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
  },
}
