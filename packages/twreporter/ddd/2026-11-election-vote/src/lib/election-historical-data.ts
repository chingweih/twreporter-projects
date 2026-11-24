import { z } from 'zod'
import {
  createElectionSheet,
  sheetCount as count,
  sheetNumber as number,
  sheetPercentage as percentage,
} from './election-sheet.ts'

const historicalTab = createElectionSheet({
  spreadsheetId: '1cbvf1PuITskiXlqfQrt3n9RjLVFzE3Wf_tZRgj9iuDM',
  queryNamespace: '2026-11-election-vote-historical',
})
const text = z.string()
const blank = text
  .trim()
  .length(0)
  .transform(() => null)
const nullableCount = count.or(blank)
const nullablePercentage = percentage.or(blank)
const signedCount = number.pipe(z.int())

const districtResult = z.object({
  選舉: count,
  縣市: text,
  鄉鎮市區: text,
  towncode: text,
  號次: count,
  姓名: text,
  政黨: text,
  得票數: count,
  得票率: percentage,
  選舉人數: count,
  投票數: count,
  有效票: count,
  無效票: count,
  投票率: percentage,
})
const villageResult = districtResult.extend({
  villagecode: text,
  村里: text,
  性別: text,
  現任: text,
  當選: text,
  里內名次: count,
})

// Rates use percentage points. Administrative codes and election-cycle labels stay as text.
export const historicalElectionTabs = {
  mayorWinners: historicalTab(
    '0',
    z.object({
      縣市: text,
      '2022 投票日': text,
      當選人: text,
      政黨: text,
      得票數: count,
      '得票率（%）': percentage,
    }),
  ),
  mayorPartyHistory: historicalTab(
    '1876095441',
    z.object({
      縣市: text,
      屆次: text,
      選舉區域: text,
      當選人: text,
      政黨: text,
    }),
  ),
  mayorPartySeatHistory: historicalTab(
    '766249989',
    z.object({
      屆次: text,
      國民黨: count,
      民進黨: count,
      民眾黨: count,
      親民黨: count,
      新黨: count,
      無黨籍: count,
      合計: count,
    }),
  ),
  referendumResults: historicalTab(
    '640468238',
    z.object({
      案次: text,
      年份: count,
      投票權人: count,
      投票率: percentage,
      同意占投票數: percentage,
      同意票: count,
      不同意票: count,
      '同意−不同意': signedCount,
      門檻: count,
      '同意−門檻': signedCount,
      結果: text,
      同日: text,
    }),
  ),
  mayorTurnoutHistory: historicalTab(
    '1981346507',
    z.object({ 屆次: text, '縣市長投票率（%）': percentage }),
  ),
  taipeiMayorTurnoutHistory: historicalTab(
    '1206203173',
    z.object({ 屆次: text, '台北市長投票率（%）': percentage }),
  ),
  taipeiMayorMobilizationHistory: historicalTab(
    '1855037673',
    z.object({
      台北市長屆次: text,
      '國民黨催票率（%）': percentage,
      '民進黨催票率（%）': nullablePercentage,
      '無黨籍催票率（%）': nullablePercentage,
      '新黨催票率（%）': nullablePercentage,
    }),
  ),
  councilPartySeats: historicalTab(
    '1697680477',
    z.object({
      議會: text,
      總席次: count,
      過半門檻: nullableCount,
      國民黨席次: count,
      民進黨席次: count,
      民眾黨席次: count,
      親民黨席次: count,
      新黨席次: count,
      台聯席次: count,
      時代力量席次: count,
      其他席次: count,
      無黨籍席次: count,
      '國民黨席次占比（%）': percentage,
      '民進黨席次占比（%）': percentage,
    }),
  ),
  councilNominations: historicalTab(
    '1597483995',
    z.object({
      縣市: text,
      政黨: text,
      '2026 所屬聯盟': text,
      '2018 提名': nullableCount,
      '2018 當選': nullableCount,
      '2022 提名': count,
      '2022 當選': count,
      '2026 登記': count,
    }),
  ),
  councilorAgeDistribution: historicalTab(
    '1937871767',
    z.object({
      縣市: text,
      當選人數: count,
      '未滿 40 歲（人）': count,
      '40–49 歲（人）': count,
      '50–59 歲（人）': count,
      '60 歲以上（人）': count,
      '中位數（歲）': number,
    }),
  ),
  // The tab has no headers yet. Retain its CSV fields as text until it has a schema.
  candidateBirthdays: historicalTab('1177261302', z.object({}).catchall(text)),
  councilorGenderDistribution: historicalTab(
    '557839697',
    z.object({
      縣市: text,
      當選人: count,
      女性: count,
      男性: count,
      '2022 女性比例（%）': percentage,
    }),
  ),
  hualienFuFamilyResults: historicalTab(
    '159550621',
    z.object({
      年: count,
      候選人: text,
      推薦政黨: text,
      得票: nullableCount,
      '得票率（%）': nullablePercentage,
      '催票率（%）': nullablePercentage,
      結果: text,
      名次: nullableCount.or(z.literal('—').transform(() => null)),
      參選人數: nullableCount,
    }),
  ),
  taipeiMayorByVillage: historicalTab('1894534225', villageResult),
  taipeiMayorByTownship: historicalTab('427942331', districtResult),
  newTaipeiMayorByVillage: historicalTab('864705621', villageResult),
  newTaipeiMayorByTownship: historicalTab('72983163', districtResult),
}
