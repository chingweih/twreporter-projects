import {
  keepPolygonsWithin,
  taiwanBounds,
  type TaiwanDistrictCollection,
  type TaiwanVillageCollection,
} from '@lab-reporter/ddd-atlas/taiwan/map'

export type CityGeometry = {
  districts: TaiwanDistrictCollection
  villages: TaiwanVillageCollection
}

export function kaohsiungMapDistricts(
  districts: TaiwanDistrictCollection,
): TaiwanDistrictCollection {
  return {
    type: 'FeatureCollection',
    features: districts.features.map((district) =>
      keepPolygonsWithin(
        district,
        taiwanBounds.mainIsland,
        district.properties.name,
      ),
    ),
  }
}

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
