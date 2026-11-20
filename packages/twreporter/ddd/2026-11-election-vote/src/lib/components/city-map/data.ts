import counties from '@lab-reporter/ddd-atlas/taiwan/counties' with { type: 'json' }
import { cityGroupByName, type CityGroup } from '../../city-groups.ts'
import type { electionTabs } from '../../election-data.ts'

const countiesByCode = new Map(
  counties.features.map((county) => [county.properties.code, county]),
)
const countiesByName = new Map(
  counties.features.map((county) => [county.properties.name, county]),
)
export const countiesByGroup = new Map<
  CityGroup,
  (typeof counties.features)[number][]
>()
for (const [city, group] of Object.entries(cityGroupByName)) {
  const county = countiesByName.get(city)
  if (!county) throw new Error(`找不到「${city}」的圖資。`)
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
    const code = row.縣市代碼.trim().padStart(5, '0')
    if (!countiesByCode.has(code)) throw new Error(`找不到縣市代碼 ${code}。`)
    if (results.has(code)) throw new Error(`縣市代碼 ${code} 重複。`)
    results.set(code, row)
  }
  return results
}
