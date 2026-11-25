import { defineElectionBatch } from '../batch-config.ts'

export const firstBatch = defineElectionBatch({
  configUrl: './election-vote.json',
  previewStoryId: 'components-electionvote--default',
  graphics: {
    '1-city-map': { title: '2026縣市首長當選人一覽' },
    '2-city-grid': { title: '歷屆縣市長黨籍變化' },
    '3-party-city-result': {
      title: '歷屆縣市長席次變化',
      mode: 'stacked',
      chartBackdrop: false,
      showXAxis: false,
      barGap: 4,
      yAxisFontSize: 16,
      showTotals: false,
      valuePosition: 'left',
    },
    '4-ref-result': {
      title: '2026核電公投通過／不通過',
      mode: 'grouped',
      groupGap: 10,
      chartBackdrop: false,
      valuePosition: 'left',
      showTotals: false,
      barGap: 4,
    },
  },
})
