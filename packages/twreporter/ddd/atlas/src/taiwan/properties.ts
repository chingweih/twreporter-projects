import { z } from "zod";

const countyCode = z.string().regex(/^\d{5}$/);
const districtCode = z.string().regex(/^\d{8}$/);
const villageCode = z.string().regex(/^[\dA-Z]{11}$/);

export const taiwanCountyGroup = z.enum(["北", "中", "南", "東", "離島"]);
export type TaiwanCountyGroup = z.infer<typeof taiwanCountyGroup>;

export const countyProperties = z.strictObject({
  countyCode,
  name: z.string().min(1),
  group: taiwanCountyGroup,
});
export type TaiwanCountyProperties = z.infer<typeof countyProperties>;

export const districtProperties = z.strictObject({
  districtCode,
  name: z.string().min(1),
  countyCode,
});
export type TaiwanDistrictProperties = z.infer<typeof districtProperties>;

export const villageProperties = z.strictObject({
  villageCode,
  name: z.string().min(1).nullable(),
  countyCode,
  districtCode,
  note: z.string().min(1).exactOptional(),
});
export type TaiwanVillageProperties = z.infer<typeof villageProperties>;
