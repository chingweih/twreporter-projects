import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import Papa from "papaparse";
import { z } from "zod";
import { readJsonFile } from "../generate/geojson.ts";
import {
  villageCode,
  villageExtentStatus,
  villageProperties,
  type TaiwanVillageChanges,
  type TaiwanVillageProperties,
} from "./properties.ts";
import { countyGroupByCode, hanText } from "./schema.ts";

const villageChangeRow = z.strictObject({
  before_year: z.string().regex(/^\d{4}$/),
  after_year: z.string().regex(/^\d{4}$/),
  comparison_unit: z.string().trim().min(1),
  before_id: villageCode,
  after_id: villageCode,
  before_name: hanText,
  after_name: hanText,
  change_type: z.string(),
  reason: z.string(),
  extent_status: z.union([villageExtentStatus, z.literal("")]).optional(),
  missing_geometry: z.enum(["before", "after", "both", ""]).optional(),
});

const villageCollection = z.object({
  features: z.array(z.object({ properties: villageProperties })),
});

type VillageMembership = {
  name: string;
  unit: string;
  missingGeometry: boolean;
};

type VillageChangePair = Pick<
  TaiwanVillageChanges,
  "beforeYear" | "afterYear"
> & {
  groups: Map<string, TaiwanVillageChanges["groups"][number]>;
  before: Map<string, VillageMembership>;
  after: Map<string, VillageMembership>;
};

function compareKeys(left: string, right: string) {
  if (left === right) return 0;
  return left < right ? -1 : 1;
}

export function readVillageChanges(file: string) {
  const parsed = Papa.parse(readFileSync(file, "utf8"), {
    header: true,
    skipEmptyLines: "greedy",
  });
  const [parseError] = parsed.errors;
  if (parseError) {
    const location =
      parseError.row === undefined
        ? file
        : `${file}, data row ${parseError.row + 1}`;
    throw new Error(`${location}: ${parseError.message}`);
  }
  assert(!parsed.meta.renamedHeaders, `${file}: duplicate CSV headers`);
  assert(parsed.data.length, `${file}: expected at least one data row`);

  const pairs = new Map<string, VillageChangePair>();
  for (const [index, value] of parsed.data.entries()) {
    const location = `${file}, data row ${index + 1}`;
    const result = villageChangeRow.safeParse(value);
    if (!result.success) {
      throw new Error(`${location}:\n${z.prettifyError(result.error)}`);
    }
    const row = result.data;
    const {
      before_year: beforeYear,
      after_year: afterYear,
      comparison_unit: id,
    } = row;
    assert(
      beforeYear < afterYear,
      `${location}: before_year must be earlier than after_year`,
    );
    const pairId = `${beforeYear}-${afterYear}`;
    let pair = pairs.get(pairId);
    if (!pair) {
      pair = {
        beforeYear,
        afterYear,
        groups: new Map(),
        before: new Map(),
        after: new Map(),
      };
      pairs.set(pairId, pair);
    }
    const extent = row.extent_status || "unverified";
    let group = pair.groups.get(id);
    if (!group) {
      group = { id, beforeIds: [], afterIds: [], extent };
      pair.groups.set(id, group);
    }
    assert(
      group.extent === extent,
      `${location}: conflicting extent status for ${id}`,
    );

    for (const [side, ids] of [
      ["before", group.beforeIds],
      ["after", group.afterIds],
    ] as const) {
      const members = pair[side];
      const villageId = row[`${side}_id`];
      const name = row[`${side}_name`];
      const missingGeometry =
        row.missing_geometry === side || row.missing_geometry === "both";
      const member = members.get(villageId);
      if (member) {
        assert(
          member.name === name &&
            member.unit === id &&
            member.missingGeometry === missingGeometry,
          `${location}: conflicting membership for ${side} village ${villageId}`,
        );
      } else {
        members.set(villageId, { name, unit: id, missingGeometry });
        ids.push(villageId);
      }
    }
  }
  return Array.from(
    pairs.values(),
    ({ beforeYear, afterYear, groups, before, after }) => ({
      changes: { beforeYear, afterYear, groups: [...groups.values()] },
      before,
      after,
    }),
  );
}

function validateCoverage(
  year: string,
  villages: readonly TaiwanVillageProperties[],
  members: ReadonlyMap<string, VillageMembership>,
  file: string,
) {
  const assigned = new Set(
    villages
      .filter(({ unassigned }) => !unassigned)
      .map(({ villageCode }) => villageCode),
  );
  for (const code of assigned) {
    assert(
      members.has(code),
      `${file}: ${year} village ${code} is missing from the pair`,
    );
  }
  for (const [code, { missingGeometry }] of members) {
    if (missingGeometry) {
      assert(
        !assigned.has(code),
        `${file}: ${year} village ${code} has a polygon and is marked missing`,
      );
    } else {
      assert(
        assigned.has(code),
        `${file}: ${year} village ${code} has no assigned polygon`,
      );
    }
  }
}

export function villageNamesForYear({
  pairs,
  file,
  year,
  villages,
}: {
  pairs: ReturnType<typeof readVillageChanges>;
  file: string;
  year: string;
  villages: readonly TaiwanVillageProperties[];
}) {
  const names = new Map<string, string>();
  for (const {
    changes: { beforeYear, afterYear },
    before,
    after,
  } of pairs) {
    if (year !== beforeYear && year !== afterYear) continue;
    const pairLocation = `${file} (${beforeYear}-${afterYear})`;
    const members = year === beforeYear ? before : after;
    validateCoverage(year, villages, members, pairLocation);
    for (const [code, { name }] of members) {
      const priorName = names.get(code);
      assert(
        priorName === undefined || priorName === name,
        `${pairLocation}: conflicting ${year} name for ${code}`,
      );
      names.set(code, name);
    }
  }
  return names;
}

export function buildVillageChanges({
  pairs,
  file,
  geometriesRoot,
}: {
  pairs: ReturnType<typeof readVillageChanges>;
  file: string;
  geometriesRoot: string;
}) {
  const changes = pairs
    .map(({ changes }) => changes)
    .sort(
      (left, right) =>
        compareKeys(left.beforeYear, right.beforeYear) ||
        compareKeys(left.afterYear, right.afterYear),
    );
  const years = new Set(
    changes.flatMap(({ beforeYear, afterYear }) => [beforeYear, afterYear]),
  );
  for (const year of years) {
    const villages = Array.from(countyGroupByCode.keys()).flatMap((code) =>
      readJsonFile(
        join(geometriesRoot, year, "counties", code, "villages.json"),
        villageCollection,
      ).features.map(({ properties }) => properties),
    );
    const names = villageNamesForYear({ pairs, file, year, villages });
    for (const { villageCode, name, unassigned } of villages) {
      assert(
        unassigned || names.get(villageCode) === name,
        `${file}: ${year} name for village ${villageCode} differs from the snapshot. Run pnpm generate ${year}.`,
      );
    }
  }
  for (const { groups } of changes) {
    groups.sort((left, right) => compareKeys(left.id, right.id));
    for (const { beforeIds, afterIds } of groups) {
      beforeIds.sort();
      afterIds.sort();
    }
  }
  return changes;
}
