import type { FeatureCollection, MultiPolygon, Polygon } from "geojson";
import type { TaiwanVillageProperties } from "../../src/taiwan/properties.ts";

export type { TaiwanVillageProperties };

declare const villages: FeatureCollection<
  Polygon | MultiPolygon,
  TaiwanVillageProperties
>;

export default villages;
