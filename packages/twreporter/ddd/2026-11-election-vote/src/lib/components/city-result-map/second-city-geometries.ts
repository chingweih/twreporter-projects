import taipeiDistricts from '@lab-reporter/ddd-atlas/taiwan/counties/63000/districts' with { type: 'json' }
import taipeiVillages from '@lab-reporter/ddd-atlas/taiwan/counties/63000/villages' with { type: 'json' }
import newTaipeiDistricts from '@lab-reporter/ddd-atlas/taiwan/counties/65000/districts' with { type: 'json' }
import newTaipeiVillages from '@lab-reporter/ddd-atlas/taiwan/counties/65000/villages' with { type: 'json' }
import type { CityGeometry } from './geometry.ts'

export const secondCityGeometries = new Map<string, CityGeometry>([
  ['63000', { districts: taipeiDistricts, villages: taipeiVillages }],
  ['65000', { districts: newTaipeiDistricts, villages: newTaipeiVillages }],
])
