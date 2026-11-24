import assert from "node:assert/strict";
import { sortedUniqueCodes, type Boundary } from "../generate/geojson.ts";
import type { extractVillageLayer } from "./extract.ts";
import { countyGroupByCode } from "./schema.ts";
import type { buildTiers } from "./tiers.ts";

export function assembleOutputs(
  tiers: Awaited<ReturnType<typeof buildTiers>>,
  expected: Omit<Awaited<ReturnType<typeof extractVillageLayer>>, "path">,
) {
  assert.deepEqual(
    sortedUniqueCodes(tiers.nationwideCounties, "nationwide counties"),
    expected.countyCodes,
  );
  assert.deepEqual(
    sortedUniqueCodes(tiers.nationwideDistricts, "nationwide districts"),
    expected.districtCodes,
  );
  assert.deepEqual(
    sortedUniqueCodes(tiers.countyDistricts, "county districts"),
    expected.districtCodes,
  );
  assert.deepEqual(
    sortedUniqueCodes(tiers.countyVillages, "county villages"),
    expected.villageCodes,
  );

  const countyByCode = new Map(
    tiers.nationwideCounties.map((feature) => [
      feature.properties.countyCode,
      feature,
    ]),
  );
  // Counties keep editorial region order (countyGroupByCode); districts and
  // villages stay sorted by administrative code.
  const outputs = new Map<string, Boundary[]>([
    [
      "counties.json",
      Array.from(countyGroupByCode.keys(), (code) => {
        const feature = countyByCode.get(code);
        assert(feature, `Missing generated county ${code}`);
        return feature;
      }),
    ],
    ["districts.json", tiers.nationwideDistricts],
  ]);
  for (const countyCode of countyGroupByCode.keys()) {
    const districtsInCounty = tiers.countyDistricts.filter(
      ({ properties }) => properties.countyCode === countyCode,
    );
    const villagesInCounty = tiers.countyVillages.filter(
      ({ properties }) => properties.countyCode === countyCode,
    );
    assert(districtsInCounty.length, `No districts for county ${countyCode}`);
    assert(villagesInCounty.length, `No villages for county ${countyCode}`);
    outputs.set(`counties/${countyCode}/districts.json`, districtsInCounty);
    outputs.set(`counties/${countyCode}/villages.json`, villagesInCounty);
  }
  return outputs;
}
