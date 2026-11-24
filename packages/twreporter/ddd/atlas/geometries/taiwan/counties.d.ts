import type { FeatureCollection, MultiPolygon, Polygon } from "geojson";
import type {
  TaiwanCountyGroup,
  TaiwanCountyProperties,
} from "../../src/taiwan/properties.ts";

export type { TaiwanCountyGroup, TaiwanCountyProperties };

declare const counties: FeatureCollection<
  Polygon | MultiPolygon,
  TaiwanCountyProperties
>;

export default counties;
