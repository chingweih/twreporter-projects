import defaults from '../../../public/election-vote.json' with { type: 'json' }
import { defineElectionBatch } from '../batch-config.ts'

export const firstBatch = defineElectionBatch({
  defaults,
  configUrl: './election-vote.json',
  previewStoryId: 'components-electionvote--default',
})
