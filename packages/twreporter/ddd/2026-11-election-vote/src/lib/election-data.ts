import { z } from 'zod'
import {
  createElectionSheet,
  sheetCount as count,
  sheetNumber as number,
  sheetPercentage as percentage,
} from './election-sheet.ts'

const electionTab = createElectionSheet({
  spreadsheetId: '1rrRgaTyIIhHFCUaGZ1BB4tdmx-WcoPJuKhf1w5YqKeY',
  queryNamespace: '2026-11-election-vote',
})
const text = z.string()

const county = {
  縣市: text,
  縣市代碼: text,
}
const township = {
  鄉鎮市區: text,
  鄉鎮市區代碼: text,
}
const village = {
  村里: text,
  村里代碼: text,
}
const countingProgress = {
  已開所數: count,
  應開所數: count,
  '開票進度(%)': percentage,
}
const ballotTotals = {
  投票數: count,
  有效票: count,
  無效票: count,
  '投票率(%)': percentage,
}
const candidate = {
  號次: count,
  姓名: text,
  政黨: text,
  得票數: count,
  '得票率(%)': percentage,
  當選註記: text,
}
const candidateResults = {
  ...candidate,
  性別: text,
  ...countingProgress,
  ...ballotTotals,
  選舉人數: count,
}
const analysisArea = {
  選舉: text,
  範圍: text,
  縣市代碼: text,
}

// Rates use percentage points (e.g. 67.91). Codes and notes retain the sheet's text.
export const electionTabs = {
  mayorOverview: electionTab(
    '1427019390',
    z.object({
      ...county,
      ...countingProgress,
      '投票率(%)': percentage,
      領先者: text,
      領先者政黨: text,
      領先得票: count,
      '領先得票率(%)': percentage.pipe(z.number().min(0).max(100)),
      第二名: text,
      第二名政黨: text,
      第二名得票: count,
      '第二名得票率(%)': percentage,
      差距票數: count,
      當選註記: text,
    }),
  ),
  mayorCandidates: electionTab(
    '1156841378',
    z.object({ ...county, ...candidateResults }),
  ),
  mayorByTownship: electionTab(
    '614079164',
    z.object({ ...county, ...township, ...candidateResults }),
  ),
  mayorByVillage: electionTab(
    '1702445830',
    z.object({
      ...county,
      ...township,
      ...village,
      ...candidate,
      投開票所數: count,
      ...ballotTotals,
      選舉人數: count,
    }),
  ),
  councilors: electionTab(
    '1538875295',
    z.object({
      類別: text,
      ...county,
      選舉區: text,
      ...candidateResults,
    }),
  ),
  townshipMayors: electionTab(
    '1438786048',
    z.object({ ...county, ...township, ...candidateResults }),
  ),
  townshipRepresentatives: electionTab(
    '1868641016',
    z.object({
      類別: text,
      ...county,
      ...township,
      選舉區: text,
      ...candidateResults,
    }),
  ),
  villageChiefs: electionTab(
    '378489786',
    z.object({ ...county, ...township, ...village, ...candidateResults }),
  ),
  electedCandidateAnalysis: electionTab(
    '828170316',
    z.object({
      ...analysisArea,
      ...township,
      平均年齡: number,
      女性: count,
      男性: count,
      各黨當選: text,
    }),
  ),
  partyVoteShares: electionTab(
    '1359624398',
    z.object({
      ...analysisArea,
      政黨: text,
      得票數: count,
      '得票率(%)': percentage,
      政黨代碼: text,
      代碼對照方式: text,
    }),
  ),
  referendum: electionTab(
    '2090430821',
    z.object({
      層級: text,
      ...county,
      ...township,
      同意票: count,
      '同意率(%)': percentage,
      不同意票: count,
      '不同意率(%)': percentage,
      '同意票占投票權人總數(%)': percentage,
      通過註記: text,
      ...countingProgress,
      ...ballotTotals,
      投票權人數: count,
    }),
  ),
  fetchLog: electionTab(
    '1123746298',
    z.object({
      抓取時間: text,
      選舉: text,
      階段: text,
      資料時間: text,
      資料狀態: text,
      已開所數: count,
      應開所數: count,
      '開票完成率(%)': percentage,
      GCS: text,
      試算表: text,
      備註: text,
    }),
  ),
  mayorWinners: electionTab(
    '1093605211',
    z.object({
      ...county,
      號次: count,
      姓名: text,
      政黨: text,
      性別: text,
      得票數: count,
      '得票率(%)': percentage,
      '催票率(%)': percentage,
      有效票: count,
      選舉人數: count,
      '投票率(%)': percentage,
    }),
  ),
  councilPartySeats: electionTab(
    '353170477',
    z.object({
      ...county,
      政黨: text,
      當選席次: count,
      總席次: count,
      '席次比例(%)': percentage,
    }),
  ),
  councilorAgeDistribution: electionTab(
    '1205371306',
    z.object({
      ...county,
      未滿40歲: count,
      '40-49歲': count,
      '50-59歲': count,
      '60歲以上': count,
      年齡不明: count,
      當選人數: count,
      '未滿40歲(%)': percentage,
      '40-49歲(%)': percentage,
      '50-59歲(%)': percentage,
      '60歲以上(%)': percentage,
      平均年齡: number,
    }),
  ),
  councilorGenderDistribution: electionTab(
    '470490366',
    z.object({
      ...county,
      女性: count,
      男性: count,
      當選人數: count,
      '女性比例(%)': percentage,
      '男性比例(%)': percentage,
    }),
  ),
}
