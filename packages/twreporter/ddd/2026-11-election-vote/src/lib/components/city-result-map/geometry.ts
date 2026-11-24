import taipeiDistricts from '@lab-reporter/ddd-atlas/taiwan/counties/63000/districts' with { type: 'json' }
import taipeiVillages from '@lab-reporter/ddd-atlas/taiwan/counties/63000/villages' with { type: 'json' }
import newTaipeiDistricts from '@lab-reporter/ddd-atlas/taiwan/counties/65000/districts' with { type: 'json' }
import newTaipeiVillages from '@lab-reporter/ddd-atlas/taiwan/counties/65000/villages' with { type: 'json' }
import type {
  TaiwanDistrictCollection,
  TaiwanVillageCollection,
} from '@lab-reporter/ddd-atlas/taiwan/map'

export type CityGeometry = {
  districts: TaiwanDistrictCollection
  villages: TaiwanVillageCollection
}

export const cityGeometries = new Map<string, CityGeometry>([
  ['63000', { districts: taipeiDistricts, villages: taipeiVillages }],
  ['65000', { districts: newTaipeiDistricts, villages: newTaipeiVillages }],
])

export function assignedVillagesInDistrict(
  villages: TaiwanVillageCollection,
  districtCode?: string,
) {
  return districtCode
    ? villages.features.filter(
        ({ properties }) =>
          !properties.unassigned && properties.districtCode === districtCode,
      )
    : []
}
