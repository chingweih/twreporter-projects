import type { FeatureCollection, MultiPolygon, Polygon } from "geojson";
import type { TaiwanVillageProperties } from "../../src/taiwan/properties.ts";

export type { TaiwanVillageProperties };

export type TaiwanVillageCollection = FeatureCollection<
  Polygon | MultiPolygon,
  TaiwanVillageProperties
>;

declare const villages: TaiwanVillageCollection;

export default villages;
