import { defineElectionBatch } from '../batch-config.ts'

export const firstBatch = defineElectionBatch({
  configUrl: './election-vote.json',
  previewStoryId: 'components-electionvote--default',
  graphics: {
    '1-city-map': {
      title: '2026縣市首長當選人一覽',
      containerAspectRatio: 0.8,
    },
    '2-city-grid': {
      title: '歷屆縣市長黨籍變化',
      containerAspectRatio: 0.8,
      hoverFocusXAxis: true,
      hoverFocusYAxis: true,
      showTooltip: false,
      chartBackdrop: false,
      showXAxis: true,
      showValues: false,
      cellGap: 4,
    },
    '3-party-city-result': {
      title: '歷屆縣市長席次變化',
      mode: 'stacked',
      containerAspectRatio: 0.8,
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
      containerAspectRatio: 0.8,
      groupGap: 10,
      chartBackdrop: false,
      valuePosition: 'left',
      showTotals: false,
      barGap: 4,
      hoverFocusXAxis: false,
    },
  },
})
