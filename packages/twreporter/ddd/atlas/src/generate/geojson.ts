import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import type { Feature, MultiPolygon, Polygon, Position } from "geojson";
import { z } from "zod";
import {
  GeoJSON2DMultiPolygonSchema,
  GeoJSON2DPolygonSchema,
  GeoJSON2DPositionSchema,
  GeoJSONFeatureCollectionGenericSchema,
  type GeoJSONProperties,
} from "zod-geojson";
import type {
  TaiwanCountyProperties,
  TaiwanDistrictProperties,
  TaiwanVillageProperties,
} from "../taiwan/properties.ts";

// WGS84 extent covering Taiwan and outlying territories (Taiping Island ~10.37N,
// Chiwei Islet ~124.56E). Rejects coordinates from an incorrect source projection.
const taiwanExtent = { minLon: 114, maxLon: 125, minLat: 10, maxLat: 27 };

export type Boundary = Feature<
  Polygon | MultiPolygon,
  TaiwanCountyProperties | TaiwanDistrictProperties | TaiwanVillageProperties
>;

export function featureCode({ properties }: Boundary) {
  if ("villageCode" in properties) return properties.villageCode;
  if ("districtCode" in properties) return properties.districtCode;
  return properties.countyCode;
}

export function sortedUniqueCodes(
  features: readonly Boundary[],
  label: string,
) {
  const codes = features.map(featureCode).sort();
  assert.equal(
    new Set(codes).size,
    codes.length,
    `Duplicate codes in ${label}`,
  );
  return codes;
}

function ringPositionsValid(ring: readonly Position[]) {
  const seen = new Set<string>();
  // zod-geojson already validates ring closure and >= 4 positions; stop before
  // the closing vertex, which repeats ring[0].
  for (let i = 0; i < ring.length - 1; i++) {
    const [lon, lat] = ring[i];
    if (
      lon < taiwanExtent.minLon ||
      lon > taiwanExtent.maxLon ||
      lat < taiwanExtent.minLat ||
      lat > taiwanExtent.maxLat
    ) {
      return false;
    }
    const key = `${lon},${lat}`;
    if (seen.has(key)) return false;
    seen.add(key);
  }
  return true;
}

const polygonGeometry = z
  .discriminatedUnion("type", [
    GeoJSON2DPolygonSchema,
    GeoJSON2DMultiPolygonSchema,
  ])
  .refine(
    (value) =>
      value.coordinates.length > 0 &&
      (value.type === "Polygon"
        ? value.coordinates.every(ringPositionsValid)
        : value.coordinates.every(
            (rings) => rings.length > 0 && rings.every(ringPositionsValid),
          )),
    "Expected closed non-empty WGS84 polygon rings without repeated vertices",
  );

export function collection<Item>(features: Item[]) {
  return { type: "FeatureCollection", features } as const;
}

export function collectionSchema<Fields extends GeoJSONProperties>(
  fields: z.ZodType<Fields>,
) {
  return GeoJSONFeatureCollectionGenericSchema(
    GeoJSON2DPositionSchema,
    fields,
    polygonGeometry,
  ).transform(({ features }) =>
    // Drop non-standard keys Mapshaper may leave on Feature/FeatureCollection.
    collection(
      features.map(({ geometry, properties }) => ({
        type: "Feature" as const,
        geometry,
        properties,
      })),
    ),
  );
}

export function readJsonFile<Schema extends z.ZodType>(
  file: string,
  schema: Schema,
): z.output<Schema> {
  return schema.parse(JSON.parse(readFileSync(file, "utf8")));
}
