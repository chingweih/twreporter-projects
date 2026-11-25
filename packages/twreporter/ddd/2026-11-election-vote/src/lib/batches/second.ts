import { defineElectionBatch } from '../batch-config.ts'

const taipei = '63000'
const newTaipei = '65000'

export const secondBatch = defineElectionBatch({
  configUrl: './election-vote-second.json',
  previewStoryId: 'components-electionvotesecondbatch--default',
  graphics: {
    '1-city-turnout': {
      title: '歷屆縣市長選舉投票率',
      showArea: true,
      showValue: true,
      showXAxis: true,
      showYAxis: true,
      showXGrid: true,
      showYGrid: true,
      yTickCount: 5,
      yMax: 100,
    },
    '2-taipei-turnout': { title: '歷屆台北市長投票率' },
    '3-taipei-mobilization': {
      name: 'city-mobilization',
      city: taipei,
      title: '台北市長選舉歷屆各黨催票率變化',
    },
    '4-city-council-party': { title: '2026各縣市議會席次比較' },
    '5-tpp-gogo': { title: '2026民眾黨、台灣前進議員提名與當選狀態' },
    '6-council-age': { title: '2026當選議員年齡分布' },
    '7-council-sex': { title: '2026當選議員性別分布' },
    '8-hualien': { title: '傅家王朝歷屆得票率變化' },
    '9-taipei-result-map': {
      name: 'city-result-map',
      city: taipei,
      title: '2026台北市長選舉結果地圖',
    },
    '10-ntp-result-map': {
      name: 'city-result-map',
      city: newTaipei,
      title: '2026新北市長選舉結果地圖',
    },
    '11-taipei-comparison-map': {
      name: 'city-comparison-map',
      city: taipei,
      title: '2026台北市長選舉結果與2022比較地圖',
    },
    '12-ntp-comparison-map': {
      name: 'city-comparison-map',
      city: newTaipei,
      title: '2026新北市長選舉結果與2022比較地圖',
    },
  },
})
