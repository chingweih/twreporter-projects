import counties, {
  type TaiwanCountyGroup,
} from '@lab-reporter/ddd-atlas/taiwan/counties' with { type: 'json' }
import type { historicalElectionTabs } from '../../election-historical-data.ts'

const countiesByName = new Map(
  counties.features.map((county) => [county.properties.name, county]),
)
export const countiesByGroup = new Map<
  TaiwanCountyGroup,
  (typeof counties.features)[number][]
>()
for (const county of counties.features) {
  const { group } = county.properties
  const members = countiesByGroup.get(group)
  if (members) members.push(county)
  else countiesByGroup.set(group, [county])
}

type MayorOverviewRow = Awaited<
  ReturnType<typeof historicalElectionTabs.mayorWinners.fetchRows>
>[number]

export function indexMayorResults(rows: MayorOverviewRow[]) {
  const results = new Map<string, MayorOverviewRow>()
  for (const row of rows) {
    const county = countiesByName.get(row.縣市.trim().replaceAll('臺', '台'))
    if (!county) throw new Error(`找不到縣市 ${row.縣市}。`)
    const { countyCode } = county.properties
    if (results.has(countyCode))
      throw new Error(`縣市代碼 ${countyCode} 重複。`)
    results.set(countyCode, row)
  }
  return results
}
