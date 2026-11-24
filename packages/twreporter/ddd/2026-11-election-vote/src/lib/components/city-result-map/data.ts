import type { electionTabs } from '../../election-data.ts'
import type { historicalElectionTabs } from '../../election-historical-data.ts'
import { resolvePartyColor } from '../../party-colors.ts'
import type { CityGeometry } from './geometry.ts'

export type HistoricalCityGeometry = CityGeometry & {
  townshipResults: typeof historicalElectionTabs.taipeiMayorByTownship
  villageResults: typeof historicalElectionTabs.taipeiMayorByVillage
}

export type HistoricalAreaRow = Awaited<
  ReturnType<
    HistoricalCityGeometry['townshipResults' | 'villageResults']['fetchRows']
  >
>[number]

type TownshipRow = Awaited<
  ReturnType<typeof electionTabs.mayorByTownship.fetchRows>
>[number]
type VoteRow = Pick<
  TownshipRow,
  '縣市代碼' | '號次' | '姓名' | '政黨' | '得票數' | '得票率(%)'
>
export type AreaResult = {
  leader: VoteRow
  tied: boolean
  majorPartyCandidates: VoteRow[]
}
export const noLeader = '--elec-grayscale-2'

export function indexHistoricalAreaResults({
  rows,
  cityCode,
  villages,
}: {
  rows: HistoricalAreaRow[]
  cityCode: string | undefined
  villages: boolean
}) {
  return indexAreaResults({
    rows: rows
      .filter(({ 選舉 }) => 選舉 === 2022)
      .map((row) => ({
        ...row,
        縣市代碼: row.towncode.trim().padStart(8, '0').slice(0, 5),
        政黨: row.政黨.trim() === '無黨籍及未經政黨推薦' ? '無黨籍' : row.政黨,
        '得票率(%)': row.得票率,
      })),
    cityCode,
    codeLength: villages ? 11 : 8,
    getCode: (row) =>
      villages && 'villagecode' in row ? row.villagecode : row.towncode,
  })
}

export function areaColor(result?: AreaResult) {
  return result && !result.tied
    ? resolvePartyColor(result.leader.政黨.trim()).colorVar
    : noLeader
}

export function indexAreaResults<Row extends VoteRow>({
  rows,
  cityCode,
  codeLength,
  getCode,
}: {
  rows: Row[]
  cityCode: string | undefined
  codeLength: 8 | 11
  getCode: (row: Row) => string
}) {
  const candidatesByArea = new Map<string, Map<number, VoteRow>>()
  for (const row of rows) {
    if (row.縣市代碼.trim().padStart(5, '0') !== cityCode || !row.姓名.trim())
      continue
    for (const part of getCode(row).split('、')) {
      const code = part.trim()
      if (!code) continue
      const key = code.padStart(codeLength, '0')
      let candidates = candidatesByArea.get(key)
      if (!candidates) {
        candidates = new Map()
        candidatesByArea.set(key, candidates)
      }
      const existing = candidates.get(row.號次)
      if (!existing || row.得票數 > existing.得票數) {
        candidates.set(row.號次, row)
      }
    }
  }

  const results = new Map<string, AreaResult>()
  for (const [code, candidates] of candidatesByArea) {
    const ranked = Array.from(candidates.values()).sort(
      (a, b) => b.得票數 - a.得票數 || a.號次 - b.號次,
    )
    const [leader, runnerUp] = ranked
    if (!leader || leader.得票數 === 0) continue

    results.set(code, {
      leader,
      tied: runnerUp?.得票數 === leader.得票數,
      majorPartyCandidates: ranked.filter(({ 政黨 }) => {
        const party = 政黨.trim()
        return party === '民主進步黨' || party === '中國國民黨'
      }),
    })
  }
  return results
}
