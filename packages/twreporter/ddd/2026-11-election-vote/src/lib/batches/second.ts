import { defineElectionBatch } from '../batch-config.ts'

const taipei = '63000'

export const secondBatch = defineElectionBatch({
  configUrl: './election-vote-second.json',
  previewStoryId: 'components-electionvotesecondbatch--default',
  graphics: {
    '1-city-turnout': { title: '歷屆縣市長選舉投票率' },
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
  },
})
