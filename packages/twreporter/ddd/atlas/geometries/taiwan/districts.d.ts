import type { FeatureCollection, MultiPolygon, Polygon } from "geojson";
import type { TaiwanDistrictProperties } from "../../src/taiwan/properties.ts";

export type { TaiwanDistrictProperties };

declare const districts: FeatureCollection<
  Polygon | MultiPolygon,
  TaiwanDistrictProperties
>;

export default districts;
