import {
  requireCsvColumns,
  type CSVData,
} from '@lab-reporter/ddd-shared/utils/fetchers.ts'
import {
  answerCsvRowSchema,
  answerRowSchema,
  reviewRowSchema,
  reviewCsvRowSchema,
  type AnswerRow,
  type CardExplorerConfig,
  type Policy,
} from './types.ts'

function answerKey(
  answer: Pick<AnswerRow, 'questionId' | 'city' | 'candidate'>,
) {
  return JSON.stringify([answer.city, answer.candidate, answer.questionId])
}

export function readPolicies({
  answers,
  reviews,
  config,
}: {
  answers: CSVData
  reviews: CSVData
  config: CardExplorerConfig
}): Policy[] {
  requireCsvColumns(answers, answerRowSchema.keyof().options)
  requireCsvColumns(reviews, reviewRowSchema.keyof().options)
  const candidateNames = new Set(
    config.candidates.map((candidate) => candidate.name),
  )
  const verdictLabels = new Set(config.verdicts.map((verdict) => verdict.label))
  if (candidateNames.size !== config.candidates.length)
    throw new Error('候選人姓名不可重複。')
  if (verdictLabels.size !== config.verdicts.length)
    throw new Error('評比名稱不可重複。')
  const topics = config.categories.flatMap((category) => category.topics)
  const byAnswer = new Map<string, Policy>()
  const policies = answers.rows.map((row, index): Policy => {
    const parsed = answerCsvRowSchema.safeParse(row)
    if (!parsed.success)
      throw new Error(
        `Answers CSV 第 ${index + 2} 列：${parsed.error.issues.map((issue) => `${issue.path.join('.')} ${issue.message}`).join('；')}`,
      )
    const answer = parsed.data
    if (!candidateNames.has(answer.candidate))
      throw new Error(`找不到候選人設定：${answer.candidate}`)
    if (
      topics.filter((topic) => answer.questionId.startsWith(topic.id))
        .length !== 1
    )
      throw new Error(`題目 ID 必須對應一個主題：${answer.questionId}`)
    const key = answerKey(answer)
    if (byAnswer.has(key))
      throw new Error(
        `政見資料重複：${answer.city}／${answer.candidate}／${answer.questionId}`,
      )
    const policy: Policy = { ...answer, csvRow: row, reviews: [] }
    byAnswer.set(key, policy)
    return policy
  })
  reviews.rows.forEach((row, index) => {
    const parsed = reviewCsvRowSchema.safeParse(row)
    if (!parsed.success)
      throw new Error(
        `Reviews CSV 第 ${index + 2} 列：${parsed.error.issues.map((issue) => `${issue.path.join('.')} ${issue.message}`).join('；')}`,
      )
    const review = parsed.data
    if (review.verdict !== null && !verdictLabels.has(review.verdict))
      throw new Error(`找不到評比顏色設定：${review.verdict}`)
    const policy = byAnswer.get(answerKey(review))
    if (!policy)
      throw new Error(
        `評析找不到對應政見：${review.city}／${review.candidate}／${review.questionId}`,
      )
    policy.reviews.push({ ...review, csvRow: row })
  })
  return policies
}
