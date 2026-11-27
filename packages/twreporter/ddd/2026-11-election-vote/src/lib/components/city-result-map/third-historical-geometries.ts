import kaohsiungDistricts from '@lab-reporter/ddd-atlas/taiwan/2022/counties/64000/districts' with { type: 'json' }
import kaohsiungVillages from '@lab-reporter/ddd-atlas/taiwan/2022/counties/64000/villages' with { type: 'json' }
import taichungDistricts from '@lab-reporter/ddd-atlas/taiwan/2022/counties/66000/districts' with { type: 'json' }
import taichungVillages from '@lab-reporter/ddd-atlas/taiwan/2022/counties/66000/villages' with { type: 'json' }
import tainanDistricts from '@lab-reporter/ddd-atlas/taiwan/2022/counties/67000/districts' with { type: 'json' }
import tainanVillages from '@lab-reporter/ddd-atlas/taiwan/2022/counties/67000/villages' with { type: 'json' }
import taoyuanDistricts from '@lab-reporter/ddd-atlas/taiwan/2022/counties/68000/districts' with { type: 'json' }
import taoyuanVillages from '@lab-reporter/ddd-atlas/taiwan/2022/counties/68000/villages' with { type: 'json' }
import { historicalElectionTabs } from '../../election-historical-data.ts'
import type { HistoricalCityGeometry } from './data.ts'
import { kaohsiungMapDistricts } from './geometry.ts'

export const thirdHistoricalGeometries = new Map<
  string,
  HistoricalCityGeometry
>([
  [
    '68000',
    {
      districts: taoyuanDistricts,
      villages: taoyuanVillages,
      townshipResults: historicalElectionTabs.taoyuanMayorByTownship,
      villageResults: historicalElectionTabs.taoyuanMayorByVillage,
    },
  ],
  [
    '66000',
    {
      districts: taichungDistricts,
      villages: taichungVillages,
      townshipResults: historicalElectionTabs.taichungMayorByTownship,
      villageResults: historicalElectionTabs.taichungMayorByVillage,
    },
  ],
  [
    '67000',
    {
      districts: tainanDistricts,
      villages: tainanVillages,
      townshipResults: historicalElectionTabs.tainanMayorByTownship,
      villageResults: historicalElectionTabs.tainanMayorByVillage,
    },
  ],
  [
    '64000',
    {
      districts: kaohsiungMapDistricts(kaohsiungDistricts),
      villages: kaohsiungVillages,
      townshipResults: historicalElectionTabs.kaohsiungMayorByTownship,
      villageResults: historicalElectionTabs.kaohsiungMayorByVillage,
    },
  ],
])
