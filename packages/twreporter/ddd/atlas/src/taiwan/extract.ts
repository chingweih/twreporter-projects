import assert from "node:assert/strict";
import { existsSync, mkdirSync, readdirSync } from "node:fs";
import { basename, join } from "node:path";
import mapshaper from "mapshaper";
import {
  collectionSchema,
  readJsonFile,
  sortedUniqueCodes,
} from "../generate/geojson.ts";
import { countyGroupByCode, outputSchemas } from "./schema.ts";

export async function extractVillageLayer(work: string, sourceArchive: string) {
  assert(
    existsSync(sourceArchive),
    `Missing boundary archive: ${sourceArchive}`,
  );
  const extracted = join(work, "raw");
  mkdirSync(extracted, { recursive: true });
  // Source archives are geographic TWD97 (GRS80); reproject explicitly to WGS84
  // in case a future archive ships in projected TM2.
  await mapshaper.runCommands([
    "-i",
    sourceArchive,
    "encoding=utf8",
    "-quiet",
    "-proj",
    "wgs84",
    "-o",
    `${extracted}/`,
    "format=geojson",
  ]);
  const layers = readdirSync(extracted)
    .filter((file) => file.endsWith(".json"))
    .map((file) => ({
      name: basename(file, ".json"),
      path: join(extracted, file),
    }));
  assert.equal(
    layers.length,
    1,
    `Expected one layer in ${sourceArchive}, found: ${layers.map((layer) => layer.name).join(", ")}`,
  );
  const [layer] = layers;
  const { features } = readJsonFile(
    layer.path,
    collectionSchema(outputSchemas.villages),
  );
  assert(features.length > 0, `Empty village layer in ${sourceArchive}`);

  const villageCodes = sortedUniqueCodes(features, layer.name);
  const districtCodes = Array.from(
    new Set(features.map(({ properties }) => properties.districtCode)),
  ).sort();
  const countyCodes = Array.from(
    new Set(features.map(({ properties }) => properties.countyCode)),
  ).sort();
  assert.deepEqual(
    countyCodes,
    Array.from(countyGroupByCode.keys()).sort(),
    "Source counties do not match countyGroups",
  );
  return { path: layer.path, countyCodes, districtCodes, villageCodes };
}
