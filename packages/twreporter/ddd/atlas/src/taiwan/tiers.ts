import { mkdirSync } from "node:fs";
import { join } from "node:path";
import mapshaper from "mapshaper";
import {
  collectionSchema,
  featureCode,
  readJsonFile,
} from "../generate/geojson.ts";
import { outputSchemas } from "./schema.ts";

// Zoom-tier Douglas-Peucker tolerances. Levels in the same tier are dissolved
// upward from one simplified topology so their shared borders sit flush.
const nationwideIntervalMeters = 200;
const countyIntervalMeters = 43;
const precisionDegrees = 0.000001;

export async function buildTiers(work: string, rawPath: string) {
  const nationwideDir = join(work, "nationwide");
  const countyDir = join(work, "county");
  mkdirSync(nationwideDir, { recursive: true });
  mkdirSync(countyDir, { recursive: true });

  await mapshaper.runCommands([
    "-i",
    rawPath,
    "-quiet",
    "-clean",
    "-dissolve",
    "TOWNCODE",
    "copy-fields=COUNTYCODE,COUNTYNAME,TOWNNAME",
    "name=districts",
    "-simplify",
    "dp",
    `interval=${nationwideIntervalMeters}m`,
    "keep-shapes",
    "-dissolve",
    "COUNTYCODE",
    "copy-fields=COUNTYNAME",
    "+",
    "name=counties",
    "-o",
    `${nationwideDir}/`,
    "target=counties,districts",
    "format=geojson",
    `precision=${precisionDegrees}`,
    "fix-geometry",
  ]);
  await mapshaper.runCommands([
    "-i",
    rawPath,
    "-quiet",
    "-clean",
    "-rename-layers",
    "villages",
    "-simplify",
    "dp",
    `interval=${countyIntervalMeters}m`,
    "keep-shapes",
    "-dissolve",
    "TOWNCODE",
    "copy-fields=COUNTYCODE,TOWNNAME",
    "+",
    "name=districts",
    "-o",
    `${countyDir}/`,
    "target=districts,villages",
    "format=geojson",
    `precision=${precisionDegrees}`,
    "fix-geometry",
  ]);

  const nationwideCounties = readJsonFile(
    join(nationwideDir, "counties.json"),
    collectionSchema(outputSchemas.counties),
  ).features;
  const nationwideDistricts = readJsonFile(
    join(nationwideDir, "districts.json"),
    collectionSchema(outputSchemas.districts),
  ).features;
  const countyDistricts = readJsonFile(
    join(countyDir, "districts.json"),
    collectionSchema(outputSchemas.districts),
  ).features;
  const countyVillages = readJsonFile(
    join(countyDir, "villages.json"),
    collectionSchema(outputSchemas.villages),
  ).features;

  for (const list of [nationwideDistricts, countyDistricts, countyVillages]) {
    list.sort((left, right) => {
      const a = featureCode(left);
      const b = featureCode(right);
      return a < b ? -1 : a > b ? 1 : 0;
    });
  }
  return {
    nationwideCounties,
    nationwideDistricts,
    countyDistricts,
    countyVillages,
  };
}
