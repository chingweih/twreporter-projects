import { defineElectionBatch } from '../batch-config.ts'

export const thirdResultMap = 'third-city-result-map'
export const thirdComparisonMap = 'third-city-comparison-map'

const taoyuan = '68000'
const taichung = '66000'
const tainan = '67000'
const kaohsiung = '64000'

export const thirdBatch = defineElectionBatch({
  configUrl: './election-vote-third.json',
  previewStoryId: 'components-electionvotethirdbatch--default',
  graphics: {
    '1-ty-result-map': {
      name: thirdResultMap,
      city: taoyuan,
      title: '2026桃園市長選舉結果地圖',
    },
    '2-tc-result-map': {
      name: thirdResultMap,
      city: taichung,
      title: '2026台中市長選舉結果地圖',
    },
    '3-tn-result-map': {
      name: thirdResultMap,
      city: tainan,
      title: '2026台南市長選舉結果地圖',
    },
    '4-kh-result-map': {
      name: thirdResultMap,
      city: kaohsiung,
      title: '2026高雄市長選舉結果地圖',
    },
    '5-ty-comparison-map': {
      name: thirdComparisonMap,
      city: taoyuan,
      title: '2026桃園市長選舉結果與2022比較地圖',
    },
    '6-tc-comparison-map': {
      name: thirdComparisonMap,
      city: taichung,
      title: '2026台中市長選舉結果與2022比較地圖',
    },
    '7-tn-comparison-map': {
      name: thirdComparisonMap,
      city: tainan,
      title: '2026台南市長選舉結果與2022比較地圖',
    },
    '8-kh-comparison-map': {
      name: thirdComparisonMap,
      city: kaohsiung,
      title: '2026高雄市長選舉結果與2022比較地圖',
    },
  },
})
