import kaohsiungDistricts from '@lab-reporter/ddd-atlas/taiwan/counties/64000/districts' with { type: 'json' }
import kaohsiungVillages from '@lab-reporter/ddd-atlas/taiwan/counties/64000/villages' with { type: 'json' }
import taichungDistricts from '@lab-reporter/ddd-atlas/taiwan/counties/66000/districts' with { type: 'json' }
import taichungVillages from '@lab-reporter/ddd-atlas/taiwan/counties/66000/villages' with { type: 'json' }
import tainanDistricts from '@lab-reporter/ddd-atlas/taiwan/counties/67000/districts' with { type: 'json' }
import tainanVillages from '@lab-reporter/ddd-atlas/taiwan/counties/67000/villages' with { type: 'json' }
import taoyuanDistricts from '@lab-reporter/ddd-atlas/taiwan/counties/68000/districts' with { type: 'json' }
import taoyuanVillages from '@lab-reporter/ddd-atlas/taiwan/counties/68000/villages' with { type: 'json' }
import { kaohsiungMapDistricts, type CityGeometry } from './geometry.ts'

export const thirdCityGeometries = new Map<string, CityGeometry>([
  ['68000', { districts: taoyuanDistricts, villages: taoyuanVillages }],
  ['66000', { districts: taichungDistricts, villages: taichungVillages }],
  ['67000', { districts: tainanDistricts, villages: tainanVillages }],
  [
    '64000',
    {
      districts: kaohsiungMapDistricts(kaohsiungDistricts),
      villages: kaohsiungVillages,
    },
  ],
])
