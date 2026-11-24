import assert from "node:assert/strict";
import { z } from "zod";
import {
  countyProperties,
  districtProperties,
  taiwanCountyGroup,
  villageProperties,
  type TaiwanCountyGroup,
  type TaiwanVillageProperties,
} from "./properties.ts";

// Editorial region order used directly by map legends and result lists.
const countyGroups = {
  北: ["63000", "65000", "10017", "68000", "10004", "10018", "10005"],
  中: ["66000", "10007", "10008", "10009"],
  南: ["10010", "10020", "67000", "64000", "10013"],
  東: ["10002", "10015", "10014"],
  離島: ["10016", "09020", "09007"],
} satisfies Record<TaiwanCountyGroup, readonly string[]>;

const countyGroupEntries = taiwanCountyGroup.options.flatMap((group) =>
  countyGroups[group].map((code) => [code, group] as const),
);
export const countyGroupByCode = new Map<string, TaiwanCountyGroup>(
  countyGroupEntries,
);
assert.equal(
  countyGroupByCode.size,
  countyGroupEntries.length,
  "County groups contain duplicate codes",
);

export const expectedSnapshotFiles = [
  "counties.json",
  "districts.json",
  ...Array.from(countyGroupByCode.keys(), (code) => [
    `counties/${code}/districts.json`,
    `counties/${code}/villages.json`,
  ]).flat(),
];

const hasHan = /\p{Script=Han}/u;
const cleanText = z
  .string()
  .refine(
    (value) => !value.includes("\uFFFD"),
    "Unexpected replacement character (check DBF UTF-8 encoding)",
  )
  .transform((value) => value.trim().replaceAll("臺", "台"));
const hanText = cleanText.refine(
  (value) => hasHan.test(value),
  "Expected Traditional Chinese text (check DBF UTF-8 encoding)",
);

export const outputSchemas = {
  counties: z
    .object({ COUNTYCODE: cleanText, COUNTYNAME: hanText })
    .transform(({ COUNTYCODE, COUNTYNAME }) => {
      const group = countyGroupByCode.get(COUNTYCODE);
      assert(group, `Missing group for county ${COUNTYCODE}`);
      return { countyCode: COUNTYCODE, name: COUNTYNAME, group };
    })
    .pipe(countyProperties),
  districts: z
    .object({ COUNTYCODE: cleanText, TOWNCODE: cleanText, TOWNNAME: hanText })
    .transform(({ TOWNCODE, TOWNNAME, COUNTYCODE }) => ({
      districtCode: TOWNCODE,
      name: TOWNNAME,
      countyCode: COUNTYCODE,
    }))
    .pipe(districtProperties)
    .superRefine(({ districtCode, countyCode }, ctx) => {
      if (!districtCode.startsWith(countyCode)) {
        ctx.addIssue({
          code: "custom",
          path: ["districtCode"],
          message: `District ${districtCode} does not match county ${countyCode}`,
        });
      }
    }),
  villages: z
    .object({
      // COUNTYNAME and TOWNNAME are validated here to catch DBF encoding issues
      // before Mapshaper dissolves them into county and district layers.
      COUNTYCODE: cleanText,
      COUNTYNAME: hanText,
      TOWNCODE: cleanText,
      TOWNNAME: hanText,
      VILLCODE: cleanText,
      VILLNAME: cleanText.nullable(),
      NOTE: cleanText.nullable(),
    })
    .transform(
      ({
        VILLCODE,
        VILLNAME,
        COUNTYCODE,
        TOWNCODE,
        NOTE,
      }): TaiwanVillageProperties => {
        const result: TaiwanVillageProperties = {
          villageCode: VILLCODE,
          name: VILLNAME || null,
          unassigned: !VILLNAME,
          countyCode: COUNTYCODE,
          districtCode: TOWNCODE,
        };
        if (NOTE) result.note = NOTE;
        return result;
      },
    )
    .pipe(villageProperties)
    .superRefine(({ villageCode, name, districtCode, countyCode }, ctx) => {
      if (name !== null && !hasHan.test(name)) {
        ctx.addIssue({
          code: "custom",
          path: ["name"],
          message: `Village ${villageCode} name is not Traditional Chinese: ${name}`,
        });
      }
      if (
        !districtCode.startsWith(countyCode) ||
        !villageCode.startsWith(districtCode)
      ) {
        ctx.addIssue({
          code: "custom",
          path: ["villageCode"],
          message: `Village ${villageCode} has mismatched parent codes (${countyCode} / ${districtCode})`,
        });
      }
    }),
};
