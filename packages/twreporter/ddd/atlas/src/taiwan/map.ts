import type {
  Feature,
  FeatureCollection,
  MultiPolygon,
  Polygon,
} from "geojson";
import type { TaiwanCountyProperties } from "./properties.ts";

export interface GeoBounds {
  minLon: number;
  maxLon: number;
  minLat: number;
  maxLat: number;
}

export interface TaiwanCountyInset {
  countyCode: string;
  geometry: FeatureCollection<Polygon | MultiPolygon, TaiwanCountyProperties>;
}

export interface TaiwanCountySplit {
  mainIsland: FeatureCollection<Polygon | MultiPolygon, TaiwanCountyProperties>;
  insets: TaiwanCountyInset[];
}

export const taiwanBounds = {
  // Excludes distant outlying islets (Pengjia, Mianhua, Dongsha, Taiping, Diaoyutai)
  // so national maps frame Taiwan's main island.
  mainIsland: {
    minLon: 119.8,
    maxLon: 122.2,
    minLat: 21.8,
    maxLat: 25.4,
  } satisfies GeoBounds,
  // Excludes Wuqiu (~119.45E) so Kinmen main islands fill an inset box.
  kinmen: {
    minLon: 118.1,
    maxLon: 118.6,
    minLat: 24.3,
    maxLat: 24.6,
  } satisfies GeoBounds,
} as const;

const kinmenCountyCode = "09020";

// Keeps only whole polygon parts whose exterior ring lies completely inside bounds
// (does not geometrically clip straddling rings). Throws if no part remains.
export function keepPolygonsWithin<Props>(
  feature: Feature<Polygon | MultiPolygon, Props>,
  bounds: GeoBounds,
  label?: string,
): Feature<Polygon | MultiPolygon, Props> {
  const polygons =
    feature.geometry.type === "Polygon"
      ? [feature.geometry.coordinates]
      : feature.geometry.coordinates;
  const kept = polygons.filter(([ring]) =>
    ring.every(
      ([lon, lat]) =>
        lon > bounds.minLon &&
        lon < bounds.maxLon &&
        lat > bounds.minLat &&
        lat < bounds.maxLat,
    ),
  );
  if (kept.length === 0) {
    const target =
      label ?? (feature.id !== undefined ? String(feature.id) : "");
    throw new Error(
      `No polygon parts${target ? ` for ${target}` : ""} remained within bounds`,
    );
  }
  const result: Feature<Polygon | MultiPolygon, Props> = {
    ...feature,
    geometry:
      kept.length === 1
        ? { type: "Polygon", coordinates: kept[0] }
        : { type: "MultiPolygon", coordinates: kept },
  };
  // Drop any cached bbox because removed parts invalidate it (RFC 7946 §5).
  delete result.bbox;
  return result;
}

export function splitTaiwanCounties(
  counties: FeatureCollection<Polygon | MultiPolygon, TaiwanCountyProperties>,
): TaiwanCountySplit {
  const mainFeatures: Feature<
    Polygon | MultiPolygon,
    TaiwanCountyProperties
  >[] = [];
  const insets: TaiwanCountyInset[] = [];

  for (const county of counties.features) {
    const label = `${county.properties.name} (${county.properties.countyCode})`;
    if (county.properties.group === "離島") {
      const feature =
        county.properties.countyCode === kinmenCountyCode
          ? keepPolygonsWithin(county, taiwanBounds.kinmen, label)
          : county;
      insets.push({
        countyCode: county.properties.countyCode,
        geometry: { type: "FeatureCollection", features: [feature] },
      });
    } else {
      mainFeatures.push(
        keepPolygonsWithin(county, taiwanBounds.mainIsland, label),
      );
    }
  }

  return {
    mainIsland: { type: "FeatureCollection", features: mainFeatures },
    insets,
  };
}
