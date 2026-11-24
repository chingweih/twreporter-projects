import type { FeatureCollection, MultiPolygon, Polygon } from "geojson";
import type { TaiwanDistrictProperties } from "../../src/taiwan/properties.ts";

export type { TaiwanDistrictProperties };

export type TaiwanDistrictCollection = FeatureCollection<
  Polygon | MultiPolygon,
  TaiwanDistrictProperties
>;

declare const districts: TaiwanDistrictCollection;

export default districts;
