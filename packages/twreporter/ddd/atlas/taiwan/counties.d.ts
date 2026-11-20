import type { FeatureCollection, MultiPolygon, Polygon } from "geojson";

export type TaiwanCountyProperties = {
  code: string;
  name: string;
};

declare const counties: FeatureCollection<
  Polygon | MultiPolygon,
  TaiwanCountyProperties
>;

export default counties;
