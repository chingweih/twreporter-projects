import counties, {
  type TaiwanCountyGroup,
} from '@lab-reporter/ddd-atlas/taiwan/counties' with { type: 'json' }
import type { electionTabs } from '../../election-data.ts'

const countiesByCode = new Map(
  counties.features.map((county) => [county.properties.countyCode, county]),
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
  ReturnType<typeof electionTabs.mayorOverview.fetchRows>
>[number]

export function indexMayorResults(rows: MayorOverviewRow[]) {
  const results = new Map<string, MayorOverviewRow>()
  for (const row of rows) {
    const countyCode = row.縣市代碼.trim().padStart(5, '0')
    if (!countiesByCode.has(countyCode))
      throw new Error(`找不到縣市代碼 ${countyCode}。`)
    if (results.has(countyCode))
      throw new Error(`縣市代碼 ${countyCode} 重複。`)
    results.set(countyCode, row)
  }
  return results
}
